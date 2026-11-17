#!/bin/bash
# Fluxo completo oferta -> contrato. Requer a app rodando, curl, jq e o cliente mysql.
# Cria 2 imóveis, 1 cliente de teste e os PDFs; apaga tudo no final (o banco volta como estava).
# Uso: ./testar-fluxo.sh [url]   (padrão http://localhost:8080)

cd "$(dirname "$0")"
B=${1:-http://localhost:8080}
J='Content-Type: application/json'
FALHAS=0

check() {
    if [ "$2" = "$3" ]; then echo "OK      $1 (esperado $2, recebido $3)"
    else echo "FALHOU  $1 (esperado $2, recebido $3)"; FALHAS=$((FALHAS + 1)); fi
}

TMP=$(mktemp -d)
CORPO="$TMP/corpo"

# req METODO caminho token [json] -> corpo em $CORPO, devolve o código HTTP
req() {
    local args=(-s -o "$CORPO" -w '%{http_code}' -X "$1" "$B$2")
    [ -n "$3" ] && args+=(-H "Authorization: Bearer $3")
    [ -n "$4" ] && args+=(-H "$J" -d "$4")
    curl "${args[@]}"
}

# upload do contrato: up ofertaId token arquivo
up() {
    curl -s -o "$CORPO" -w '%{http_code}' -X POST "$B/contratos/oferta/$1" \
        -H "Authorization: Bearer $2" -F "file=@$3"
}

sql() {
    local senha
    senha=$(grep '^spring.datasource.password=' src/main/resources/application.properties | cut -d= -f2-)
    MYSQL_PWD="$senha" mysql -uroot restaurante -N -e "$1"
}

status_imovel() { curl -s $B/imoveis/$1 | jq -r '.status'; }
status_oferta() { sql "SELECT status FROM ofertas WHERE id = $1"; }

# PDF mínimo e um arquivo que não é PDF
printf '%%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%%%EOF\n' > "$TMP/contrato.pdf"
echo "isto não é um pdf" > "$TMP/falso.pdf"

# 1. logins
curl -s -o /dev/null -X POST $B/public/register -H "$J" \
    -d '{"nome":"Cliente 2 teste","email":"cliente2@t.com","password":"1234","role":"COMPRADOR"}'
login() { curl -s -X POST $B/public/login -H "$J" -d "{\"email\":\"$1\",\"password\":\"1234\"}" | jq -r '.token // empty'; }
ADMIN=$(login admin@t.com)
USER=$(login user@t.com)
CLI2=$(login cliente2@t.com)
[ -z "$ADMIN" ] || [ -z "$USER" ] || [ -z "$CLI2" ] && { echo "FALHOU  login - a app está rodando? rodou o testar-jwt.sh antes?"; exit 1; }

# 2. imóveis de teste: A venda, B aluguel
criar_imovel() {
    curl -s -o /dev/null -D - -X POST $B/imoveis -H "$J" -H "Authorization: Bearer $ADMIN" -d "{
      \"titulo\": \"Teste fluxo $1\", \"finalidade\": \"$2\", \"status\": \"DISPONIVEL\",
      \"precoVenda\": $3, \"precoAluguel\": $4, \"dormitorios\": 2,
      \"tipoImovel\": { \"id\": 1 }, \"bairro\": { \"id\": 1 } }" \
      | grep -i '^location:' | sed 's#.*/##' | tr -d '\r'
}
A=$(criar_imovel A VENDA 500000 null)
BB=$(criar_imovel B ALUGUEL null 2000)
[ -z "$A" ] || [ -z "$BB" ] && { echo "FALHOU  criar imóveis de teste"; exit 1; }
echo "imóveis de teste: A=$A (venda) B=$BB (aluguel)"

limpar() {
    local ofertas pdfs cli2_id
    ofertas="SELECT id FROM ofertas WHERE imovel_id IN ($A, $BB)"
    pdfs=$(sql "SELECT caminho_pdf FROM contratos WHERE oferta_id IN ($ofertas)")
    for f in $pdfs; do rm -f "uploads/contratos/$(basename "$f")"; done
    rmdir uploads/contratos 2>/dev/null   # só some se ficou vazia
    sql "DELETE FROM contratos WHERE oferta_id IN ($ofertas); DELETE FROM ofertas WHERE imovel_id IN ($A, $BB);"
    for id in $A $BB; do req DELETE /imoveis/$id "$ADMIN" > /dev/null; done
    cli2_id=$(curl -s $B/users -H "Authorization: Bearer $ADMIN" | jq -r '.[] | select(.email == "cliente2@t.com") | .id')
    [ -n "$cli2_id" ] && req DELETE /users/$cli2_id "$ADMIN" > /dev/null
    rm -rf "$TMP"
    echo "limpeza: contratos e PDFs, ofertas, imóveis $A/$BB e cliente2@t.com apagados"
}
trap limpar EXIT

oferta() { echo "{\"imovelId\": $1, \"tipo\": \"$2\", \"valorProposto\": $3, \"mensagem\": \"teste\"}"; }

# 3. duas ofertas no imóvel A; admin aceita a do USER
req POST /ofertas "$USER" "$(oferta $A VENDA 480000)" > /dev/null; O1=$(jq -r '.id' "$CORPO")
req POST /ofertas "$CLI2" "$(oferta $A VENDA 490000)" > /dev/null; O2=$(jq -r '.id' "$CORPO")
check "admin aceita oferta do USER"                    200 $(req PATCH /ofertas/$O1/aceitar "$ADMIN")
check "  oferta do cliente2 em espera"                 EM_ESPERA $(status_oferta $O2)

# 4. criar contrato
check "USER cria contrato (endpoint de admin)"         403 $(up $O1 "$USER" "$TMP/contrato.pdf")
check "contrato para oferta não aceita"                409 $(up $O2 "$ADMIN" "$TMP/contrato.pdf")
echo "        -> $(jq -r '.error' "$CORPO")"
check "contrato com arquivo que não é PDF"             400 $(up $O1 "$ADMIN" "$TMP/falso.pdf")
check "admin cria contrato com PDF"                    201 $(up $O1 "$ADMIN" "$TMP/contrato.pdf")
K1=$(jq -r '.id' "$CORPO")
check "  nasce aguardando assinatura"                  AGUARDANDO_ASSINATURA $(jq -r '.status' "$CORPO")
check "  ainda sem aprovação"                          null $(jq -r '.dataAprovacao' "$CORPO")
check "segundo contrato para a mesma oferta"           409 $(up $O1 "$ADMIN" "$TMP/contrato.pdf")

# 5. antes de aprovar o cliente não vê nem assina
req GET /contratos/meus "$USER" > /dev/null
check "  USER não vê contrato não aprovado"            0 $(jq "[.[] | select(.id == $K1)] | length" "$CORPO")
check "USER assina contrato não aprovado"              409 $(req PATCH /contratos/$K1/assinar "$USER")
echo "        -> $(jq -r '.error' "$CORPO")"
check "USER baixa PDF não aprovado"                    403 $(req GET /contratos/$K1/pdf "$USER")
check "ADMIN baixa o PDF"                              200 $(req GET /contratos/$K1/pdf "$ADMIN")
check "  conteúdo é PDF"                               %PDF $(head -c 4 "$CORPO")

# 6. USER em endpoints de admin
check "USER lista contratos"                           403 $(req GET /contratos "$USER")
check "USER aprova"                                    403 $(req PATCH /contratos/$K1/aprovar "$USER")
check "USER cancela"                                   403 $(req PATCH /contratos/$K1/cancelar "$USER")
check "GET /contratos?status=AGUARDANDO com ADMIN"     200 $(req GET "/contratos?status=AGUARDANDO_ASSINATURA&size=100" "$ADMIN")
check "  contrato aparece na lista"                    1 $(jq "[.content[] | select(.id == $K1)] | length" "$CORPO")

# 7. cancelar contrato: imóvel volta disponível e a oferta em espera volta a pendente
check "admin cancela o contrato"                       200 $(req PATCH /contratos/$K1/cancelar "$ADMIN")
check "  contrato cancelado"                           CANCELADO $(jq -r '.status' "$CORPO")
check "  oferta do USER cancelada"                     CANCELADA $(status_oferta $O1)
check "  imóvel A volta a disponível"                  DISPONIVEL $(status_imovel $A)
check "  oferta do cliente2 volta a pendente"          PENDENTE $(status_oferta $O2)
check "cancelar de novo"                               409 $(req PATCH /contratos/$K1/cancelar "$ADMIN")

# 8. fluxo completo de venda: USER faz nova oferta, admin aceita a do cliente2, contrato, aprova, assina
req POST /ofertas "$USER" "$(oferta $A VENDA 495000)" > /dev/null; O3=$(jq -r '.id' "$CORPO")
check "admin aceita oferta do cliente2"                200 $(req PATCH /ofertas/$O2/aceitar "$ADMIN")
check "  nova oferta do USER em espera"                EM_ESPERA $(status_oferta $O3)
check "admin cria contrato"                            201 $(up $O2 "$ADMIN" "$TMP/contrato.pdf")
K2=$(jq -r '.id' "$CORPO")
check "admin aprova"                                   200 $(req PATCH /contratos/$K2/aprovar "$ADMIN")
check "  dataAprovacao preenchida"                     true $(jq '.dataAprovacao != null' "$CORPO")
echo "        -> emailEnviado=$(jq -r '.emailEnviado' "$CORPO") (sandbox do Mailgun recusa destinatário não autorizado)"
check "aprovar de novo"                                409 $(req PATCH /contratos/$K2/aprovar "$ADMIN")
req GET /contratos/meus "$CLI2" > /dev/null
check "  cliente2 vê o contrato aprovado"              1 $(jq "[.[] | select(.id == $K2)] | length" "$CORPO")
check "cliente2 baixa o PDF aprovado"                  200 $(req GET /contratos/$K2/pdf "$CLI2")
check "USER baixa PDF de outro cliente"                403 $(req GET /contratos/$K2/pdf "$USER")
check "USER assina contrato de outro cliente"          403 $(req PATCH /contratos/$K2/assinar "$USER")
check "cliente2 assina"                                200 $(req PATCH /contratos/$K2/assinar "$CLI2")
check "  contrato assinado"                            ASSINADO $(jq -r '.status' "$CORPO")
check "  dataAssinatura preenchida"                    true $(jq '.dataAssinatura != null' "$CORPO")
check "  imóvel A vendido"                             VENDIDO $(status_imovel $A)
check "  oferta em espera do USER recusada"            RECUSADA $(status_oferta $O3)
check "assinar de novo"                                409 $(req PATCH /contratos/$K2/assinar "$CLI2")
check "cancelar contrato assinado"                     409 $(req PATCH /contratos/$K2/cancelar "$ADMIN")

# 9. aluguel: imóvel B termina alugado
req POST /ofertas "$USER" "$(oferta $BB ALUGUEL 1900)" > /dev/null; O4=$(jq -r '.id' "$CORPO")
req PATCH /ofertas/$O4/aceitar "$ADMIN" > /dev/null
up $O4 "$ADMIN" "$TMP/contrato.pdf" > /dev/null; K3=$(jq -r '.id' "$CORPO")
req PATCH /contratos/$K3/aprovar "$ADMIN" > /dev/null
check "USER assina contrato de aluguel"                200 $(req PATCH /contratos/$K3/assinar "$USER")
check "  imóvel B alugado"                             ALUGADO $(status_imovel $BB)

echo
[ $FALHAS -eq 0 ] && echo "Todos os casos passaram." || echo "$FALHAS caso(s) falharam."
exit $FALHAS
