#!/bin/bash
# Testa as regras de ofertas e favoritos. Requer a app rodando, curl, jq e o cliente mysql.
# Cria 3 imóveis e 1 cliente de teste e apaga tudo no final (o banco volta como estava).
# Uso: ./testar-ofertas.sh [url]   (padrão http://localhost:8080)

cd "$(dirname "$0")"
B=${1:-http://localhost:8080}
J='Content-Type: application/json'
FALHAS=0

check() {
    if [ "$2" = "$3" ]; then echo "OK      $1 (esperado $2, recebido $3)"
    else echo "FALHOU  $1 (esperado $2, recebido $3)"; FALHAS=$((FALHAS + 1)); fi
}

# req METODO caminho token [json] -> grava o corpo em $CORPO e devolve o código HTTP
CORPO=$(mktemp)
req() {
    local args=(-s -o "$CORPO" -w '%{http_code}' -X "$1" "$B$2")
    [ -n "$3" ] && args+=(-H "Authorization: Bearer $3")
    [ -n "$4" ] && args+=(-H "$J" -d "$4")
    curl "${args[@]}"
}

# ofertas e favoritos não têm DELETE na API: a limpeza deles é por SQL (senha lida do properties, sem imprimir)
sql() {
    local senha
    senha=$(grep '^spring.datasource.password=' src/main/resources/application.properties | cut -d= -f2-)
    MYSQL_PWD="$senha" mysql -uroot restaurante -e "$1"
}

# 1. logins (cliente2 é criado só para o teste)
curl -s -o /dev/null -X POST $B/public/register -H "$J" \
    -d '{"nome":"Cliente 2 teste","email":"cliente2@t.com","password":"1234","role":"COMPRADOR"}'
login() { curl -s -X POST $B/public/login -H "$J" -d "{\"email\":\"$1\",\"password\":\"1234\"}" | jq -r '.token // empty'; }
ADMIN=$(login admin@t.com)
USER=$(login user@t.com)
CLI2=$(login cliente2@t.com)
[ -z "$ADMIN" ] || [ -z "$USER" ] || [ -z "$CLI2" ] && { echo "FALHOU  login - a app está rodando? rodou o testar-jwt.sh antes?"; exit 1; }

# 2. imóveis de teste: A venda disponível, B aluguel disponível, C vendido
criar_imovel() {
    curl -s -o /dev/null -D - -X POST $B/imoveis -H "$J" -H "Authorization: Bearer $ADMIN" -d "{
      \"titulo\": \"Teste ofertas $1\", \"finalidade\": \"$2\", \"status\": \"$3\",
      \"precoVenda\": $4, \"precoAluguel\": $5, \"dormitorios\": 2,
      \"tipoImovel\": { \"id\": 1 }, \"bairro\": { \"id\": 1 } }" \
      | grep -i '^location:' | sed 's#.*/##' | tr -d '\r'
}
A=$(criar_imovel A VENDA DISPONIVEL 450000 null)
BB=$(criar_imovel B ALUGUEL DISPONIVEL null 1800)
C=$(criar_imovel C VENDA VENDIDO 300000 null)
[ -z "$A" ] || [ -z "$BB" ] || [ -z "$C" ] && { echo "FALHOU  criar imóveis de teste"; exit 1; }
echo "imóveis de teste: A=$A B=$BB C=$C"

limpar() {
    sql "DELETE FROM ofertas WHERE imovel_id IN ($A, $BB, $C); DELETE FROM favoritos WHERE imovel_id IN ($A, $BB, $C);"
    for id in $A $BB $C; do req DELETE /imoveis/$id "$ADMIN" > /dev/null; done
    local cli2_id
    cli2_id=$(curl -s $B/users -H "Authorization: Bearer $ADMIN" | jq -r '.[] | select(.email == "cliente2@t.com") | .id')
    [ -n "$cli2_id" ] && req DELETE /users/$cli2_id "$ADMIN" > /dev/null
    rm -f "$CORPO"
    echo "limpeza: ofertas, favoritos, imóveis $A/$BB/$C e cliente2@t.com apagados"
}
trap limpar EXIT

oferta() { echo "{\"imovelId\": $1, \"tipo\": \"$2\", \"valorProposto\": $3, \"mensagem\": \"teste\"}"; }

# 3. criar oferta
check "POST /ofertas sem token"                    401 $(req POST /ofertas "" "$(oferta $A VENDA 400000)")
check "POST /ofertas com ADMIN"                    403 $(req POST /ofertas "$ADMIN" "$(oferta $A VENDA 400000)")
check "oferta em imóvel VENDIDO"                   409 $(req POST /ofertas "$USER" "$(oferta $C VENDA 280000)")
check "  mensagem do 409 em JSON"                  409 $(jq -r '.status' "$CORPO")
echo "        -> $(jq -r '.error' "$CORPO")"
check "oferta ALUGUEL em imóvel só de venda"       409 $(req POST /ofertas "$USER" "$(oferta $A ALUGUEL 2000)")
check "oferta com valor 0"                         409 $(req POST /ofertas "$USER" "$(oferta $A VENDA 0)")
check "oferta em imóvel inexistente"               404 $(req POST /ofertas "$USER" "$(oferta 999999 VENDA 1000)")

check "USER oferta VENDA no imóvel A"              201 $(req POST /ofertas "$USER" "$(oferta $A VENDA 420000)")
O1=$(jq -r '.id' "$CORPO")
check "  status da oferta nova"                    PENDENTE $(jq -r '.status' "$CORPO")
check "  usuário veio do token"                    user@t.com $(jq -r '.usuario.email' "$CORPO")
check "  senha não aparece no JSON"                null $(jq -r '.usuario.senha' "$CORPO")
check "USER oferta duplicada no imóvel A"          409 $(req POST /ofertas "$USER" "$(oferta $A VENDA 430000)")
echo "        -> $(jq -r '.error' "$CORPO")"
check "cliente2 oferta no mesmo imóvel A"          201 $(req POST /ofertas "$CLI2" "$(oferta $A VENDA 440000)")
O2=$(jq -r '.id' "$CORPO")

# 4. listagens
check "GET /ofertas/minhas (USER)"                 200 $(req GET /ofertas/minhas "$USER")
check "  oferta do imóvel A está na lista"         1 $(jq "[.[] | select(.imovel.id == $A)] | length" "$CORPO")
check "GET /ofertas com USER"                      403 $(req GET /ofertas "$USER")
check "GET /ofertas?status=PENDENTE com ADMIN"     200 $(req GET "/ofertas?status=PENDENTE&size=100" "$ADMIN")
check "  as 2 ofertas do imóvel A aparecem"        2 $(jq "[.content[] | select(.imovel.id == $A)] | length" "$CORPO")

# 5. aceitar
check "USER tenta aceitar"                         403 $(req PATCH /ofertas/$O1/aceitar "$USER")
check "cliente2 tenta cancelar oferta do USER"     403 $(req PATCH /ofertas/$O1/cancelar "$CLI2")
check "ADMIN aceita oferta do USER"                200 $(req PATCH /ofertas/$O1/aceitar "$ADMIN")
check "  oferta aceita"                            ACEITA $(jq -r '.status' "$CORPO")
req GET /imoveis/$A "" > /dev/null
check "  imóvel A ficou reservado"                 RESERVADO $(jq -r '.status' "$CORPO")
req GET /ofertas/minhas "$CLI2" > /dev/null
check "  oferta do cliente2 foi para em espera"    EM_ESPERA $(jq -r ".[] | select(.id == $O2) | .status" "$CORPO")
check "aceitar de novo"                            409 $(req PATCH /ofertas/$O1/aceitar "$ADMIN")
check "nova oferta no imóvel reservado"            409 $(req POST /ofertas "$CLI2" "$(oferta $A VENDA 450000)")

# 6. recusar e cancelar (imóvel B, aluguel)
check "cliente2 oferta ALUGUEL no imóvel B"        201 $(req POST /ofertas "$CLI2" "$(oferta $BB ALUGUEL 1700)")
O3=$(jq -r '.id' "$CORPO")
check "USER tenta recusar"                         403 $(req PATCH /ofertas/$O3/recusar "$USER")
check "ADMIN recusa"                               200 $(req PATCH /ofertas/$O3/recusar "$ADMIN")
check "  oferta recusada"                          RECUSADA $(jq -r '.status' "$CORPO")
check "USER oferta ALUGUEL no imóvel B"            201 $(req POST /ofertas "$USER" "$(oferta $BB ALUGUEL 1750)")
O4=$(jq -r '.id' "$CORPO")
check "USER cancela a própria oferta"              200 $(req PATCH /ofertas/$O4/cancelar "$USER")
check "  oferta cancelada"                         CANCELADA $(jq -r '.status' "$CORPO")
check "cancelar de novo"                           409 $(req PATCH /ofertas/$O4/cancelar "$USER")
check "ADMIN não cancela (só cliente)"             403 $(req PATCH /ofertas/$O4/cancelar "$ADMIN")

# 7. favoritos
check "POST /favoritos sem token"                  401 $(req POST /favoritos/$A "")
check "POST /favoritos com ADMIN"                  403 $(req POST /favoritos/$A "$ADMIN")
check "favoritar imóvel inexistente"               404 $(req POST /favoritos/999999 "$USER")
check "USER favorita A"                            201 $(req POST /favoritos/$A "$USER")
check "USER favorita A de novo (não duplica)"      200 $(req POST /favoritos/$A "$USER")
check "GET /favoritos"                             200 $(req GET /favoritos "$USER")
check "  A aparece uma vez"                        1 $(jq "[.[] | select(.id == $A)] | length" "$CORPO")
check "USER desfavorita A"                         204 $(req DELETE /favoritos/$A "$USER")
req GET /favoritos "$USER" > /dev/null
check "  A saiu da lista"                          0 $(jq "[.[] | select(.id == $A)] | length" "$CORPO")

echo
[ $FALHAS -eq 0 ] && echo "Todos os casos passaram." || echo "$FALHAS caso(s) falharam."
exit $FALHAS
