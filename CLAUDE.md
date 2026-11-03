# Imobiliária — Trabalho Final (Prog. Web IV, IFFar)
Monorepo: backend/ (Spring Boot 4.1.1, Java 17, MySQL "restaurante", JWT com java-jwt 4.4.0, porta 8080) e frontend/ (Angular, standalone components, porta 4200).
Enunciado e regras de negócio: docs/aulas.md, seção "Trabalho Final".

## Nível do código (importante)
- Usar SÓ o que apareceu nas aulas: Controller → Service → Repository → Model, DTOs simples, Lombok, JPA/Hibernate, Pageable, Spring Security + JWT, upload de fotos, e-mail com JavaMailSender/Thymeleaf.
- No Angular: componentes standalone, serviços com HttpClient, rotas, guards, interceptors e formulários simples. signal() básico pode (projeto zoneless); computed/effect/RxJS complexo só se necessário. Nada de NgRx, microsserviços, cache, Docker, testes e2e, arquitetura hexagonal ou abstrações genéricas.
- Código simples e legível, nomes de domínio em português (Imovel, Oferta, Contrato). Seguir o padrão dos arquivos existentes.
- Regra de negócio fica no Service (@Transactional), nunca no Controller nem no front.
- Se algo precisar de recurso que não está nas aulas, escolher a alternativa mais simples e avisar.

## Antes de codar
- Consultar em docs/aulas.md SÓ a seção da aula relacionada (ex.: "Aula 07" para paginação, "Aula 11" para JWT). Não ler o arquivo inteiro.
- Verificar o estado real dos arquivos antes de editar. Nada irreversível sem me mostrar antes.

## Git
- Commits em português, curtos, sem Co-Authored-By nem menção ao Claude. Tudo na main, sem branch nova.
- Nunca versionar segredos.

## Como responder
- Direto e objetivo. Terminar com o próximo passo executável.
