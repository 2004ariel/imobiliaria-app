#!/bin/bash
# Testa as regras dos CRUDs do admin (bairros, tipos, imóveis, fotos, usuários).
# Requer a app rodando, curl, jq, python3 e o cliente mysql.
# Cria seus próprios dados (bairro, tipo, imóvel, cliente, fotos) e apaga só eles no final.
# Uso: ./testar-cruds.sh [url]   (padrão http://localhost:8080)

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
req() {
    local args=(-s -o "$CORPO" -w '%{http_code}' -X "$1" "$B$2")
    [ -n "$3" ] && args+=(-H "Authorization: Bearer $3")
    [ -n "$4" ] && args+=(-H "$J" -d "$4")
    curl "${args[@]}"
}
upload() { curl -s -o "$CORPO" -w '%{http_code}' -X POST "$B/fotos-imoveis/upload" -H "Authorization: Bearer $1" -F "file=@$2" -F "imovelId=$3"; }
erro() { jq -r '.error' "$CORPO"; }
sql() {
    local senha
    senha=$(grep '^spring.datasource.password=' src/main/resources/application.properties | cut -d= -f2-)
    MYSQL_PWD="$senha" mysql -uroot restaurante -N -e "$1"
}

# PNG válido de 1x1 (gerado na hora) e um arquivo que não é imagem
python3 -c "
import zlib, struct, sys
def bloco(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
png = b'\x89PNG\r\n\x1a\n' + bloco(b'IHDR', struct.pack('>IIBBBBB', 1, 1, 8, 2, 0, 0, 0)) + bloco(b'IDAT', zlib.compress(b'\x00\x1f\x3a\x5f')) + bloco(b'IEND', b'')
open(sys.argv[1], 'wb').write(png)" "$TMP/foto.png"
echo "não sou imagem" > "$TMP/texto.txt"

login() { curl -s -X POST $B/public/login -H "$J" -d "{\"email\":\"$1\",\"password\":\"1234\"}" | jq -r '.token // empty'; }
ADMIN=$(login admin@t.com)
USER=$(login user@t.com)
[ -z "$ADMIN" ] || [ -z "$USER" ] && { echo "FALHOU  login - a app está rodando? rodou o testar-jwt.sh antes?"; exit 1; }

# ids criados pelo teste (a limpeza usa só eles)
BAIRRO=""; TIPO=""; IMOVEL=""; CLIENTE_ID=""
limpar() {
    [ -n "$IMOVEL" ] && sql "DELETE FROM ofertas WHERE imovel_id = $IMOVEL;" && req DELETE /imoveis/$IMOVEL "$ADMIN" > /dev/null
    [ -n "$CLIENTE_ID" ] && req DELETE /users/$CLIENTE_ID "$ADMIN" > /dev/null
    [ -n "$TIPO" ] && req DELETE /tiposimoveis/$TIPO "$ADMIN" > /dev/null
    [ -n "$BAIRRO" ] && req DELETE /bairros/$BAIRRO "$ADMIN" > /dev/null
    rm -rf "$TMP"
    echo "limpeza: imóvel $IMOVEL (ofertas e fotos), cliente $CLIENTE_ID, tipo $TIPO e bairro $BAIRRO apagados"
}
trap limpar EXIT
local_id() { grep -i '^location:' | sed 's#.*/##' | tr -d '\r'; }

# 1. USER nos endpoints de admin
check "USER cria bairro"                     403 $(req POST /bairros "$USER" '{"nome":"x","cidade":"y","estado":"RS"}')
check "USER exclui tipo"                     403 $(req DELETE /tiposimoveis/1 "$USER")
check "USER lista usuários"                  403 $(req GET /users "$USER")
check "USER edita foto"                      403 $(req PUT /fotos-imoveis/1 "$USER" '{"capa":true}')
check "USER exclui foto"                     403 $(req DELETE /fotos-imoveis/1 "$USER")
check "USER envia foto"                      403 $(upload "$USER" "$TMP/foto.png" 1)

# 2. bairros
check "bairro sem cidade"                    400 $(req POST /bairros "$ADMIN" '{"nome":"Teste","estado":"RS"}')
echo "        -> $(erro)"
BAIRRO=$(curl -s -o /dev/null -D - -X POST $B/bairros -H "$J" -H "Authorization: Bearer $ADMIN" \
    -d '{"nome":"Bairro teste CRUD","cidade":"Panambi","estado":"rs"}' | local_id)
check "cria bairro"                          true $([ -n "$BAIRRO" ] && echo true || echo false)
req GET /bairros/$BAIRRO "" > /dev/null
check "  estado em maiúsculas"               RS $(jq -r '.estado' "$CORPO")
check "edita bairro"                         204 $(req PUT /bairros/$BAIRRO "$ADMIN" '{"nome":"Bairro teste CRUD 2","cidade":"Panambi","estado":"RS"}')
check "bairro inexistente"                   404 $(req GET /bairros/999999 "")
check "exclui bairro em uso (Centro)"        409 $(req DELETE /bairros/1 "$ADMIN")
echo "        -> $(erro)"

# 3. tipos
check "tipo sem nome"                        400 $(req POST /tiposimoveis "$ADMIN" '{"descricao":"x"}')
TIPO=$(curl -s -o /dev/null -D - -X POST $B/tiposimoveis -H "$J" -H "Authorization: Bearer $ADMIN" \
    -d '{"nome":"Tipo teste CRUD","descricao":"criado pelo teste"}' | local_id)
check "cria tipo"                            true $([ -n "$TIPO" ] && echo true || echo false)
check "edita tipo"                           204 $(req PUT /tiposimoveis/$TIPO "$ADMIN" '{"nome":"Tipo teste CRUD 2","descricao":"x"}')
check "exclui tipo em uso (Casa)"            409 $(req DELETE /tiposimoveis/1 "$ADMIN")
echo "        -> $(erro)"

# 4. imóveis (usa o bairro e o tipo do teste)
check "imóvel sem título"                    400 $(req POST /imoveis "$ADMIN" "{\"finalidade\":\"VENDA\",\"precoVenda\":1,\"tipoImovel\":{\"id\":$TIPO},\"bairro\":{\"id\":$BAIRRO}}")
echo "        -> $(erro)"
check "imóvel ALUGUEL sem preço de aluguel"  400 $(req POST /imoveis "$ADMIN" "{\"titulo\":\"x\",\"finalidade\":\"ALUGUEL\",\"precoVenda\":1,\"tipoImovel\":{\"id\":$TIPO},\"bairro\":{\"id\":$BAIRRO}}")
echo "        -> $(erro)"
check "imóvel com bairro inexistente"        400 $(req POST /imoveis "$ADMIN" "{\"titulo\":\"x\",\"finalidade\":\"VENDA\",\"precoVenda\":1,\"tipoImovel\":{\"id\":$TIPO},\"bairro\":{\"id\":999999}}")
IMOVEL=$(curl -s -o /dev/null -D - -X POST $B/imoveis -H "$J" -H "Authorization: Bearer $ADMIN" \
    -d "{\"titulo\":\"Imóvel teste CRUD\",\"finalidade\":\"venda\",\"precoVenda\":250000,\"dormitorios\":2,\"tipoImovel\":{\"id\":$TIPO},\"bairro\":{\"id\":$BAIRRO}}" | local_id)
check "cria imóvel"                          true $([ -n "$IMOVEL" ] && echo true || echo false)
req GET /imoveis/$IMOVEL "" > /dev/null
check "  status padrão DISPONIVEL"           DISPONIVEL $(jq -r '.status' "$CORPO")
check "  finalidade em maiúsculas"           VENDA $(jq -r '.finalidade' "$CORPO")
check "exclui bairro agora em uso"           409 $(req DELETE /bairros/$BAIRRO "$ADMIN")
check "exclui tipo agora em uso"             409 $(req DELETE /tiposimoveis/$TIPO "$ADMIN")
NO_BANCO=$(sql "SELECT COUNT(*) FROM imoveis WHERE status = 'VENDIDO'")
req GET "/imoveis?status=VENDIDO&size=100" "" > /dev/null
check "filtro ?status=VENDIDO bate com o banco" "$NO_BANCO" $(jq '.totalElements' "$CORPO")

# 5. fotos (no imóvel do teste)
check "envia arquivo que não é imagem"       400 $(upload "$ADMIN" "$TMP/texto.txt" $IMOVEL)
echo "        -> $(erro)"
check "envia foto 1"                         201 $(upload "$ADMIN" "$TMP/foto.png" $IMOVEL)
F1=$(jq -r '.id' "$CORPO"); A1=$(jq -r '.nomeArquivo' "$CORPO")
check "  primeira foto vira capa"            true $(jq -r '.capa' "$CORPO")
check "envia foto 2"                         201 $(upload "$ADMIN" "$TMP/foto.png" $IMOVEL)
F2=$(jq -r '.id' "$CORPO"); A2=$(jq -r '.nomeArquivo' "$CORPO")
check "  segunda foto: ordem 2, sem capa"    "2 false" "$(jq -r '"\(.ordem) \(.capa)"' "$CORPO")"
check "marca foto 2 como capa"               200 $(req PUT /fotos-imoveis/$F2 "$ADMIN" '{"capa":true}')
req GET /fotos-imoveis/imovel/$IMOVEL "" > /dev/null
check "  só uma capa (a foto 2)"             "$F2" "$(jq -r '[.[] | select(.capa)] | map(.id) | join(",")' "$CORPO")"
check "ordem 0 é inválida"                   400 $(req PUT /fotos-imoveis/$F1 "$ADMIN" '{"ordem":0}')
check "muda ordem da foto 1 para 3"          200 $(req PUT /fotos-imoveis/$F1 "$ADMIN" '{"ordem":3}')
check "exclui foto 2 (a capa)"               204 $(req DELETE /fotos-imoveis/$F2 "$ADMIN")
check "  arquivo da foto 2 apagado"          false $([ -f "uploads/fotos/$A2" ] && echo true || echo false)
req GET /fotos-imoveis/imovel/$IMOVEL "" > /dev/null
check "  foto 1 virou a capa"                true $(jq -r ".[] | select(.id == $F1) | .capa" "$CORPO")
check "exclui foto inexistente"              404 $(req DELETE /fotos-imoveis/999999 "$ADMIN")

# 6. usuários
check "GET /users?busca=t.com"               200 $(req GET "/users?busca=T.COM" "$ADMIN")
check "  busca acha admin@t.com"             1 $(jq '[.[] | select(.email == "admin@t.com")] | length' "$CORPO")
check "  senha não aparece no JSON"          0 $(jq '[.[] | select(has("senha"))] | length' "$CORPO")
check "e-mail inválido"                      400 $(req POST /users "$ADMIN" '{"nome":"x","email":"sem-arroba","senha":"1234","tipo":"USER"}')
check "e-mail repetido"                      409 $(req POST /users "$ADMIN" '{"nome":"x","email":"admin@t.com","senha":"1234","tipo":"USER"}')
echo "        -> $(erro)"
check "cria cliente do teste"                201 $(req POST /users "$ADMIN" '{"nome":"Cliente CRUD","email":"cliente.crud@t.com","senha":"1234","tipo":"USER"}')
CLIENTE_ID=$(jq -r '.id' "$CORPO")
check "  resposta sem senha"                 false $(jq 'has("senha")' "$CORPO")
check "promove cliente a ADMIN"              204 $(req PUT /users/$CLIENTE_ID "$ADMIN" '{"nome":"Cliente CRUD","email":"cliente.crud@t.com","tipo":"ADMIN"}')
check "volta cliente a USER (senha em branco mantém)" 204 $(req PUT /users/$CLIENTE_ID "$ADMIN" '{"nome":"Cliente CRUD","email":"cliente.crud@t.com","senha":"","tipo":"USER"}')
CLIENTE=$(login cliente.crud@t.com)
check "  senha antiga continua valendo"      true $([ -n "$CLIENTE" ] && echo true || echo false)

ADMIN_ID=$(curl -s "$B/users?busca=admin@t.com" -H "Authorization: Bearer $ADMIN" | jq -r '.[0].id')
check "admin exclui a si mesmo"              409 $(req DELETE /users/$ADMIN_ID "$ADMIN")
echo "        -> $(erro)"
check "admin tira o próprio perfil ADMIN"    409 $(req PUT /users/$ADMIN_ID "$ADMIN" '{"nome":"ADMIN teste","email":"admin@t.com","tipo":"USER"}')
echo "        -> $(erro)"

# 7. em uso por oferta: imóvel e usuário não podem ser excluídos
check "cliente oferta no imóvel do teste"    201 $(req POST /ofertas "$CLIENTE" "{\"imovelId\":$IMOVEL,\"tipo\":\"VENDA\",\"valorProposto\":240000}")
check "exclui imóvel com oferta"             409 $(req DELETE /imoveis/$IMOVEL "$ADMIN")
echo "        -> $(erro)"
check "exclui usuário com oferta"            409 $(req DELETE /users/$CLIENTE_ID "$ADMIN")
echo "        -> $(erro)"

# 8. exclusões que devem passar (sem oferta): a limpeza faz o resto, mas confere o imóvel aqui
sql "DELETE FROM ofertas WHERE imovel_id = $IMOVEL;"
check "exclui imóvel sem oferta (leva as fotos)" 204 $(req DELETE /imoveis/$IMOVEL "$ADMIN")
check "  arquivo da foto 1 apagado"          false $([ -f "uploads/fotos/$A1" ] && echo true || echo false)
check "  fotos do imóvel saíram do banco"    0 $(sql "SELECT COUNT(*) FROM fotos_imoveis WHERE imovel_id = $IMOVEL")
IMOVEL=""
check "exclui usuário sem oferta"            204 $(req DELETE /users/$CLIENTE_ID "$ADMIN"); CLIENTE_ID=""
check "exclui tipo sem uso"                  204 $(req DELETE /tiposimoveis/$TIPO "$ADMIN"); TIPO=""
check "exclui bairro sem uso"                204 $(req DELETE /bairros/$BAIRRO "$ADMIN"); BAIRRO=""

echo
[ $FALHAS -eq 0 ] && echo "Todos os casos passaram." || echo "$FALHAS caso(s) falharam."
exit $FALHAS
