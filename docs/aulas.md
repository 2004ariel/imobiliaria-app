# Java Web — Aulas 01 a 11 + Trabalho Final

Disciplina: Padrões de persistência de objetos, conexão com bancos de dados, geração de relatórios e criação de uma aplicação web completa.
Fonte: Notion da disciplina (Apresentação da disciplina e sumário). Atualizado em 03/11/2026 — Aula 06 com a seção de DTOs publicada; nova **Aula 11 (JWT)**; **Trabalho Final** reescrito com o enunciado completo; "Estado real do repositório" no commit `44e5cdc` (Aulas 09, 10 e JWT implementadas).

---

## Aula 1 → Introdução ao Java

### Criação do primeiro projeto / Código do Main.java

```java
package principal;

class Main {
    public static void main(String[] args) {
        System.out.println("Hello world!");
    }
}
```

### Tipos de dados

```java
int idade;
double altura;
char matriculado;
boolean formando;
String nome;
```

### Modificação de valores

```java
package principal;

class Main {
    public static void main(String[] args) {
        int idade;
        double altura;
        char matriculado;
        boolean formando;
        String nome;

        nome = "Aluno 1";
        idade = 20;
        altura = 1.80;
        matriculado = 'S';
        formando = true;

        System.out.println("Nome: " + nome);
        System.out.println("Idade: " + idade);
        System.out.println("Altura: " + altura);
        System.out.println("Matriculado: " + matriculado);
        System.out.println("Formando: " + formando);
    }
}
```

### Criação de classes e instanciação

Uma classe é um molde/planta para representar objetos do mundo real. Um objeto é a coisa construída a partir desse molde.

```java
package principal;

public class Produto {
    String nome;
    double preco;
    int quantidade;
}
```

Instanciando (no Main):

```java
package principal;

class Main {
    public static void main(String[] args) {
        Produto p1 = new Produto();

        p1.nome = "Notebook";
        p1.preco = 1000;
        p1.quantidade = 5;

        System.out.println(p1.nome);
        System.out.println(p1.preco);
        System.out.println(p1.quantidade);
    }
}
```

- `Produto` é a classe.
- `p1` é o objeto dela.
- `new Produto()` cria um objeto na memória.

### Adicionando métodos na classe Produto

Métodos representam o comportamento do objeto (o que ele faz).

```java
package principal;

public class Produto {
    String nome;
    double preco;
    int quantidade;

    double valorTotalEmEstoque() {
        return preco * quantidade;
    }

    void exibirDados() {
        System.out.println("Nome: " + nome);
        System.out.println("Preço: " + preco);
        System.out.println("Quantidade: " + quantidade);
        System.out.println("Valor total em estoque: " + valorTotalEmEstoque());
    }

    void exibirDadosCompacto() {
        System.out.println(nome + " - R$" + preco + " (qtd: " + quantidade + ")");
    }
}
```

### Métodos construtores

- Construtor: bloco de código usado para inicializar um objeto, chamado automaticamente com `new Classe()`.
- Define regras sobre como o objeto deve ser inicializado.
- Todo objeto Java é instanciado a partir de um construtor, mesmo que default (implícito).

```java
public Produto(String nome, double preco, int quantidade) {
    this.nome = nome;
    this.preco = preco;
    this.quantidade = quantidade;
}
```

Uso:

```java
Produto p1 = new Produto("Notebook", 4000, 5);
p1.exibirDadosCompacto();
System.out.println("Valor total em estoque: " + p1.valorTotalEmEstoque());
```

Sobrecarga de construtores (várias assinaturas para o mesmo nome de método = polimorfismo):

```java
public Produto(String nome, double preco, int quantidade) {
    this.nome = nome;
    this.preco = preco;
    this.quantidade = quantidade;
}

public Produto(String nome, double preco) {
    this.nome = nome;
    this.preco = preco;
    this.quantidade = 0; // não veio nos parâmetros
}
```

### Encapsulamento

Restringe o acesso direto aos componentes do objeto via modificadores de acesso:

| Modificador | Visibilidade |
|---|---|
| `public` | Acessível de qualquer classe, em qualquer pacote |
| `private` | Acessível só dentro da própria classe |
| `protected` | Própria classe, subclasses e classes do mesmo pacote |
| default (nenhum) | Só classes do mesmo pacote |

Atributos geralmente são `private`; acesso via getters/setters. Vantagens: encapsulamento, manutenção, segurança.

```java
public class Produto {
    private String nome;
    private double preco;
    private int quantidade;

    public Produto(String nome, double preco, int quantidade) {
        this.nome = nome;
        setPreco(preco);
        setQuantidade(quantidade);
    }

    public String getNome() { return nome; }
    public double getPreco() { return preco; }
    public int getQuantidade() { return quantidade; }

    public void setPreco(double preco) {
        if (preco < 0) throw new IllegalArgumentException("Preço não pode ser negativo");
        this.preco = preco;
    }

    public void setQuantidade(int quantidade) {
        if (quantidade < 0) throw new IllegalArgumentException("Quantidade não pode ser negativa");
        this.quantidade = quantidade;
    }

    public double valorTotalEmEstoque() {
        return preco * quantidade;
    }

    public void exibirInfo() {
        System.out.println(nome + " - R$" + preco + " (qtd: " + quantidade + ")");
    }
}
```

### Herança

Uma classe (subclasse/filha) herda atributos e métodos de outra (superclasse/mãe). Usada quando classes compartilham comportamento mas têm particularidades.

```java
package principal;

public class ProdutoEletronico extends Produto {
    private int garantia;

    public ProdutoEletronico(String nome, double preco, int quantidade, int garantia) {
        super(nome, preco, quantidade); // chama o construtor da classe pai
        this.garantia = garantia;
    }

    public int getGarantia() { return garantia; }
}
```

```java
package principal;

public class ProdutoAlimenticio extends Produto {
    private String validade;

    public ProdutoAlimenticio(String nome, double preco, int quantidade, String validade) {
        super(nome, preco, quantidade);
        this.validade = validade;
    }

    public String getValidade() { return validade; }
}
```

```java
package principal;

class Main {
    public static void main(String[] args) {
        ProdutoEletronico teclado = new ProdutoEletronico("Teclado", 150.0, 10, 12);
        ProdutoAlimenticio arroz = new ProdutoAlimenticio("Arroz 5kg", 25.0, 40, "12/2026");

        teclado.exibirInfo();
        System.out.println("Garantia: " + teclado.getGarantia() + " meses");
    }
}
```

Pontos importantes:
- Construtores não são herdados.
- A chamada `super(...)` deve ser a primeira instrução no construtor da subclasse.
- Se a subclasse não chamar `super` explicitamente, o compilador tenta invocar o construtor padrão (sem argumentos) da superclasse — erro de compilação se ele não existir.
- **Classes abstratas**: não podem ser instanciadas diretamente; geralmente têm métodos abstratos (sem corpo) que as subclasses concretas implementam. Ex.: não faz sentido instanciar `Produto` "puro" se sempre é eletrônico ou alimentício.

### Polimorfismo

Consequência da herança: um objeto de subclasse pode ser tratado como o tipo da superclasse; cada subclasse pode sobrescrever o comportamento do mesmo método.

```java
// Na superclasse Produto
public double calcularDesconto() {
    return 0.0;
}
```

```java
// ProdutoEletronico
@Override
public double calcularDesconto() {
    return getPreco() * 0.10;
}

// ProdutoAlimenticio
@Override
public double calcularDesconto() {
    return getPreco() * 0.20;
}
```

Uma lista de `Produto` pode conter objetos de tipos diferentes, cada um executando sua própria versão do método:

```java
package principal;

import java.util.ArrayList;
import java.util.List;

class Main {
    public static void main(String[] args) {
        List<Produto> estoque = new ArrayList<>();
        estoque.add(new ProdutoEletronico("Teclado", 150.0, 10, 12));
        estoque.add(new ProdutoAlimenticio("Arroz 5 kg", 25.0, 40, "2026-12-01"));

        for (Produto p : estoque) {
            System.out.println(p.getNome() + " - desconto: R$ " + p.calcularDesconto());
        }
    }
}
```

---

## Aula 2 → Banco de dados e JDBC

### Java DataBase Connectivity (JDBC)

API do Java que permite a conexão com banco de dados.

### Driver

Conector usado: MySQL Connector/J.
Download: https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-j-26.7.0.zip

### Organização do projeto (VS Code)

Criar `.vscode/settings.json` na raiz do projeto:

```json
{
  "java.project.referencedLibraries": [
    "lib/**/*.jar"
  ]
}
```

Depois de adicionar o `.jar` ou editar o `settings.json`:
`Ctrl+Shift+P` → **Java: Clean the Java Language Server Workspace** → escolher **Reload and Delete** (força reindexar as bibliotecas).

### Criação do banco de dados

Tabela `produtos`:

| Campo | Tipo | Nulo | Extra |
|---|---|---|---|
| `id` | `int(11)` | Não | `AUTO_INCREMENT`, PK |
| `nome` | `varchar(255)` | Não | |
| `preco` | `decimal(10,2)` | Não | |
| `quantidade` | `int(11)` | Não | |

```sql
CREATE DATABASE IF NOT EXISTS pw4;
USE pw4;

CREATE TABLE produtos (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    quantidade INT(11) NOT NULL,
    PRIMARY KEY (id)
);
```

### Conexao.java

```java
package principal;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexao {
    private String driver = "com.mysql.cj.jdbc.Driver";
    private final String URL = "jdbc:mysql://localhost:3306/pw4";
    private final String USUARIO = "root";
    private final String SENHA = "";

    public Connection conectar() throws SQLException, ClassNotFoundException {
        try {
            Connection conexao = null;
            Class.forName(driver);
            conexao = DriverManager.getConnection(URL, USUARIO, SENHA);
            return conexao;
        } catch (Exception e) {
            System.out.println(e.toString());
            return null;
        }
    }
}
```

### ProdutoDAO.java

```java
package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import principal.Conexao;
import principal.Produto;

public class ProdutoDAO {

    public void salvar(Produto p) throws SQLException {
        try {
            Connection conn = new Conexao().conectar();
            PreparedStatement stmt =
                conn.prepareStatement("INSERT INTO produtos (nome, preco, quantidade) VALUES (?, ?, ?)");
            stmt.setString(1, p.getNome());
            stmt.setDouble(2, p.getPreco());
            stmt.setInt(3, p.getQuantidade());
            stmt.executeUpdate();
        } catch (Exception e) {
            System.out.println(e.toString());
        }
    }

    public List<Produto> listarTodos() throws SQLException {
        List<Produto> produtos = new ArrayList<>();

        try {
            Connection conn = new Conexao().conectar();
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM produtos");
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Produto p = new Produto();
                p.setNome(rs.getString("nome"));
                p.setPreco(rs.getDouble("preco"));
                p.setQuantidade(rs.getInt("quantidade"));
                produtos.add(p);
            }
        } catch (Exception e) {
            System.out.println(e.toString());
        } finally {
            return produtos;
        }
    }
}
```

### Main.java (teste)

```java
package principal;

import java.util.List;
import dao.ProdutoDAO;

class Main {
    public static void main(String[] args) {
        ProdutoDAO dao = new ProdutoDAO();

        try {
            List<Produto> produtos = dao.listarTodos();

            if (produtos.isEmpty()) {
                System.out.println("Nenhum produto encontrado.");
            } else {
                for (Produto p : produtos) {
                    System.out.println(p.getNome() + " - R$" + p.getPreco() + " (qtd: " + p.getQuantidade() + ")");
                }
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar produtos: " + e.getMessage());
        }
    }
}
```

### Exercícios propostos (aula 2)

1. Criar o método para editar um produto.
2. Criar o método para excluir o produto.
3. Utilizar a classe `Scanner` para inserir informações.

> **Status real (projeto no Mac, `ProjetoI`): os 3 exercícios já estão implementados.** Ver seção abaixo com o código real.

---

## Estado real do projeto (Mac / Homebrew — `ProjetoI`)

O código abaixo é o que está de fato implementado no projeto local (`~/Documents/ProgramacaoWebIV/ProjetoI`), extraído via Copilot/VS Code. Ele diverge do material genérico da aula em alguns pontos — **esta seção é a fonte da verdade**, o conteúdo acima é só a referência teórica original.

### Diferenças em relação ao material da aula

| Item | Material da aula | Projeto real |
|---|---|---|
| Build | Maven (implícito) | **Sem Maven** — classpath manual via `.vscode/settings.json` |
| Driver JDBC | — | `lib/mysql-connector-j-26.7.0.jar` (confirma que essa versão existe de fato — meu comentário anterior no projeto da aula 03, dizendo que "26.7.0 não existe", estava errado; meu conhecimento tem corte em maio/2025 e não tenho como validar versões lançadas depois disso) |
| Banco de dados | `pw4` | **`cantina`** |
| Tabela | `produtos` | **`produto`** (singular) |
| Classe modelo | `Produto` (maiúscula) | **`produto`** (minúscula, os 3 arquivos usam esse nome) |
| Campos em `Conexao` | `private`, com getter via método | `public` (`driver`, `url`, `usuario`, `senha`), sem `throws` |
| CRUD no DAO | Só `salvar` / `listarTodos` | `listarProdutos`, `salvar`, `editar`, `excluir`, `inserirProduto` (exercícios 1 e 2 feitos) |
| Entrada de dados | — | `Scanner` no `Main.java` (exercício 3 feito) |
| Herança | `ProdutoEletronico` / `ProdutoAlimenticio` (exemplo da aula) | `ProdutoEletrico` (nome real, campo `garantia` é `String`, sem getter) / `ProdutoAlimenticio` |

### Estrutura de pastas

```
ProjetoI/
├── lib/
│   └── mysql-connector-j-26.7.0.jar
├── out/
├── src/
│   ├── dao/
│   │   └── ProdutoDAO.java
│   └── principal/
│       ├── Conexao.java
│       ├── Main.java
│       ├── produto.java
│       ├── ProdutoAlimenticio.java
│       └── ProdutoEletrico.java
└── .vscode/
    └── settings.json
```

### .vscode/settings.json

```json
{
    "java.project.referencedLibraries": [
        "lib/**/*.jar"
    ],
    "java.project.sourcePaths": [
        "src"
    ],
    "java.project.outputPath": "out"
}
```

### Conexao.java

```java
package principal;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexao {
    public String driver = "com.mysql.cj.jdbc.Driver";
    public String url = "jdbc:mysql://localhost:3306/cantina";
    public String usuario = "root";
    public String senha = "";

    public Connection conectar() {
        try {
            Class.forName(driver);
            return DriverManager.getConnection(url, usuario, senha);
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
            return null;
        }
    }
}
```

### produto.java

```java
package principal;

public class produto {
    String nome;
    double preco;
    int quantidade;

    public produto() {
    }

    public produto(String nome, double preco, int quantidade) {
        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade;
    }

    public void exibirProduto() {
        System.out.println(nome + " - R$" + preco + " - Quantidade: " + quantidade);
    }

    public String getNome() { return this.nome; }
    public void setNome(String nome) { this.nome = nome; }
    public double getPreco() { return this.preco; }
    public void setPreco(double preco) { this.preco = preco; }
    public int getQuantidade() { return this.quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
}
```

### ProdutoAlimenticio.java

```java
package principal;

public class ProdutoAlimenticio extends produto {
    private String validade;

    public ProdutoAlimenticio() {
    }

    public ProdutoAlimenticio(String nome, double preco, int quantidade, String validade) {
        super(nome, preco, quantidade);
        this.validade = validade;
    }

    public String getValidade() { return this.validade; }
    public void setValidade(String validade) { this.validade = validade; }
}
```

### ProdutoEletrico.java

```java
package principal;

public class ProdutoEletrico extends produto {
    private String garantia;

    public ProdutoEletrico(String nome, double preco, int quantidade, String garantia) {
        super(nome, preco, quantidade);
        this.garantia = garantia;
    }
    // nota: sem getter/setter para garantia no projeto real
}
```

### ProdutoDAO.java

```java
package dao;

import principal.Conexao;
import principal.produto;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProdutoDAO {

    public Connection getConnection() {
        return new Conexao().conectar();
    }

    public List<produto> listarProdutos() {
        List<produto> produtos = new ArrayList<>();
        try {
            Connection conexao = getConnection();
            String sql = "SELECT * FROM produto";
            PreparedStatement stmt = conexao.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                String nome = rs.getString("nome");
                double preco = rs.getDouble("preco");
                int quantidade = rs.getInt("quantidade");
                produto p = new produto();
                p.setNome(nome);
                p.setPreco(preco);
                p.setQuantidade(quantidade);
                produtos.add(p);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return produtos;
    }

    public void salvar(produto p) {
        inserirProduto(p);
    }

    public void editar(produto p) {
        try {
            Connection conexao = new Conexao().conectar();
            String sql = "UPDATE produto SET preco = ?, quantidade = ? WHERE nome = ?";
            PreparedStatement stmt = conexao.prepareStatement(sql);
            stmt.setDouble(1, p.getPreco());
            stmt.setInt(2, p.getQuantidade());
            stmt.setString(3, p.getNome());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void excluir(String nome) {
        try {
            Connection conexao = new Conexao().conectar();
            String sql = "DELETE FROM produto WHERE nome = ?";
            PreparedStatement stmt = conexao.prepareStatement(sql);
            stmt.setString(1, nome);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void inserirProduto(produto p) {
        try {
            Connection conexao = new Conexao().conectar();
            String sql = "INSERT INTO produto (nome, preco, quantidade) VALUES (?, ?, ?)";
            PreparedStatement stmt = conexao.prepareStatement(sql);
            stmt.setString(1, p.getNome());
            stmt.setDouble(2, p.getPreco());
            stmt.setInt(3, p.getQuantidade());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

### Main.java

```java
package principal;

import dao.ProdutoDAO;
import java.util.List;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        ProdutoDAO dao = new ProdutoDAO();
        dao.getConnection();

        List<produto> produtos = dao.listarProdutos();
        if (produtos.isEmpty()) {
            System.out.println("Nenhum produto encontrado.");
        } else {
            System.out.println("Produtos encontrados:");
            for (produto p : produtos) {
                System.out.println("Nome: " + p.getNome() + ", Preço: " + p.getPreco() + ", Quantidade: " + p.getQuantidade());
            }
        }

        try (Scanner scanner = new Scanner(System.in)) {
            System.out.print("Digite o nome do produto: ");
            String nome = scanner.nextLine();
            System.out.print("Digite o preço do produto: ");
            double preco = scanner.nextDouble();
            System.out.print("Digite a quantidade do produto: ");
            int quantidade = scanner.nextInt();

            produto novoProduto = new produto();
            novoProduto.setNome(nome);
            novoProduto.setPreco(preco);
            novoProduto.setQuantidade(quantidade);

            dao.salvar(novoProduto);
            System.out.println("Produto salvo com sucesso!");

            // teste temporário de editar
            novoProduto.setPreco(150.00);
            novoProduto.setQuantidade(1);
            dao.editar(novoProduto);

            // teste temporário de excluir
            dao.excluir("Camiseta Suja");
        }
    }
}
```

> Não encontrei script SQL de criação da tabela no projeto — o schema abaixo é inferido a partir do DAO (colunas `nome`, `preco`, `quantidade`); confirme/ajuste contra o schema real do seu MySQL local.

```sql
CREATE DATABASE IF NOT EXISTS cantina;
USE cantina;

CREATE TABLE IF NOT EXISTS produto (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    quantidade INT(11) NOT NULL,
    PRIMARY KEY (id)
);
```

---

## Aula 03 → Java web - parte 1

### Atividade proposta

1. Configurar o setup com Maven + Tomcat + VS Code.
2. Criar um projeto web com duas páginas e um servlet (entender o que é e quais métodos utiliza).
3. Uma página envia uma mensagem para o servlet; o servlet envia para outra página, que apresenta a saudação.
4. Implementar o banco de dados da aula passada (aula 2) e a listagem de produtos.

### Passo a passo de configuração

1. Instalar a extensão **Extension Pack for Java** no VS Code (se ainda não tiver das aulas anteriores).
2. Baixar e configurar o **Maven**: https://maven.apache.org/download.cgi (baixar o `bin`) e configurar nas variáveis de ambiente.
3. Baixar e configurar o **Tomcat**: https://tomcat.apache.org/
   - Extrair o zip.
   - Testar (Windows): entrar no diretório via CMD (`cd ...\apache-tomcat.x\bin`), rodar `.\startup.bat`, testar em `http://localhost:8080`, parar com `.\shutdown.bat`.
4. No VS Code: **Java Overview → Create a maven project → maven-archetype-webapp**.
5. Adicionar as dependências e ajustar os arquivos de configuração (abaixo).

### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>teste</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>war</packaging>

    <name>teste Maven Webapp</name>
    <url>http://www.example.com</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.release>26</maven.compiler.release>
    </properties>

    <dependencies>
        <!-- MySQL -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>26.7.0</version>
            <scope>compile</scope>
        </dependency>

        <!-- Servlet API do Tomcat 11 -->
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>6.1.0</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>demo</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.15.0</version>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-war-plugin</artifactId>
                <version>3.4.0</version>
            </plugin>
        </plugins>
    </build>
</project>
```

### web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee
    https://jakarta.ee/xml/ns/jakartaee/web-app_6_1.xsd"
    version="6.1">

    <display-name>Demo</display-name>
</web-app>
```

### Estruturar / compilar / rodar

```bash
mvn clean compile
# ou
mvn clean package
```

Depois, executar o `.war` gerado (em `target/`) no servidor Tomcat (copiar para a pasta `webapps` do Tomcat, ou usar a extensão Tomcat for Java do VS Code).

---

## Aula 04 → Java web - continuação

### Finalização do projeto anterior

Finalizar o CRUD de produtos da aula 3 e reorganizar o projeto em pacotes:

- **`model`**: `UsuarioModel`, `ProdutoModel` — atributos privados, 2+ construtores, getters/setters.
- **`dao`**: `ProdutoDao`, `UsuarioDao`, `Conexao`.
- **`controller`**: `UsuarioController`, `ProdutoController`.

> No projeto atual (`aula03-webapp.zip`) os pacotes são `principal` (model + `Conexao`) e `servlets` (em vez de `controller`). A aula 4 pede migrar para `model`/`dao`/`controller` — decidir se renomeia os pacotes existentes ou só adiciona os novos (`UsuarioModel`, `UsuarioDao`, `UsuarioController`) ao lado do que já existe.

### Autenticação — Parte 1: fluxos básicos

Fluxos cobertos: **cadastro**, **login**, **logout** (diagramas de tela-a-tela no Notion da aula, não reproduzidos aqui — conferir lá se precisar do wireframe).

Passos:
1. Configuração da base de dados (tabela de usuários).
2. `UsuarioModel`.
3. Páginas de registro e login.
4. Ajustar `UsuarioDao` e `UsuarioController` para os novos campos.
5. Controller de autenticação (`AutenticacaoController`).
6. Página de área protegida.

#### AutenticacaoController — login (`doPost`)

```java
if (acao.equals("/login")) {
    String email = request.getParameter("email");
    String senha = request.getParameter("senha");

    UsuarioModel usuario = UsuarioDAO.login(email, senha);

    if (usuario != null && usuario.getId() != null) {
        System.out.println(usuario.toString());

        HttpSession session = request.getSession();
        session.setAttribute("usuario", usuario);
        response.sendRedirect("admin/"); // redireciona para a área logada

    } else {
        response.sendRedirect("login.jsp");
    }
}
```

### Autenticação — Parte 2: Filtros

**O que são:** Filters em JSP/Servlets interceptam e manipulam requisições/respostas antes delas chegarem ao destino. Servem para lógica comum a várias partes da aplicação (autenticação, autorização, logging, compressão de dados etc). Podem ser aplicados a um servlet específico, um conjunto de URLs ou toda a aplicação. Toda requisição passa primeiro pelo Filter antes de chegar ao Servlet, JSP ou arquivo estático:

```
HTTP Request → ServletFilter → Servlet | JSP | Static File
```

#### `filter/AuthFilter.java` — versão inicial

```java
package filter;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpFilter;

@WebFilter("/*")
public class AuthFilter extends HttpFilter implements Filter {

    public AuthFilter() {
        super();
    }

    public void destroy() {
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        System.out.println("filtrei");
        chain.doFilter(request, response);
    }

    public void init(FilterConfig fConfig) throws ServletException {
    }
}
```

> ⚠️ O material da aula usa `javax.servlet.*`. O `pom.xml` do projeto (`jakarta.servlet-api` 6.1.0, Tomcat 11) usa `jakarta.servlet.*` — confirmado no `ProdutoServlet.java` atual. Trocar todos os imports `javax.servlet.*` → `jakarta.servlet.*` ao criar o `AuthFilter`, senão não compila.

#### `doFilter` — versão final (checa autenticação)

```java
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpSession session = httpRequest.getSession(false);

    HttpServletResponse httpServletResponse = (HttpServletResponse) response;

    boolean estaLogado = (session != null && session.getAttribute("usuario") != null);

    if (estaLogado) {
        System.out.println("Usuário Logado");
    } else {
        System.out.println("Usuário Não logado");
        httpServletResponse.sendRedirect(httpRequest.getContextPath() + "/login");
    }

    chain.doFilter(request, response);
}
```

Passos:
1. Criar pasta `admin/`, mover `arealogada.jsp` para lá e renomear para `index.jsp`.
2. No login (`AutenticacaoController.doPost`), redirecionar para `admin/` (código acima).
3. Restringir o filtro só à área admin:

```java
@WebFilter("/admin/*")
public class AuthFilter extends HttpFilter implements Filter { ... }
```

### Autenticação — Parte 3: Criptografia de senha

Biblioteca necessária: `jbcrypt` (adicionar dependência no `pom.xml`, ex. `org.mindrot:jbcrypt`).

#### `util/SenhaUtil.java`

```java
package util;

import org.mindrot.jbcrypt.BCrypt;

public class SenhaUtil {

    public static String hashSenha(String senhaPura) {
        return BCrypt.hashpw(senhaPura, BCrypt.gensalt());
    }
}
```

#### `UsuarioController` — salvar novo usuário (`doPost`)

```java
String nome = request.getParameter("nome");
String email = request.getParameter("email");
String senha = request.getParameter("senha"); // senha que veio do formulário

String senhaCrip = SenhaUtil.hashSenha(senha); // senha criptografada

UsuarioModel novoUsuario = new UsuarioModel();
novoUsuario.setNome(nome);
novoUsuario.setEmail(email);
novoUsuario.setSenha(senhaCrip);

boolean resultado = UsuarioDAO.inserir(novoUsuario);
```

#### `UsuarioDAO` — login (com verificação de hash)

```java
public static UsuarioModel login(String email, String senha) {
    UsuarioModel p = new UsuarioModel();

    try {
        Connection conn = new Conexao().conectar();

        PreparedStatement statement = conn
            .prepareStatement("select * from usuarios where email=?");
        statement.setString(1, email);

        ResultSet resultSet = statement.executeQuery();

        if (resultSet.next()) {
            if (BCrypt.checkpw(senha, resultSet.getString("senha"))) {
                p.setId(resultSet.getInt("id"));
                p.setNome(resultSet.getString("nome"));
            }
        }

        conn.close();
        return p;
    } catch (Exception e) {
        return null;
    }
}
```

> Tabela referenciada: `usuarios` (plural), colunas mínimas `id`, `nome`, `email`, `senha` — não existe ainda no schema do projeto (que hoje só tem `produto`). Precisa criar via SQL antes de testar o login.

> **Duplas da turma (Notion):** Caetano/Arthur Martins, Leonardo/Caue, Julia/Carol, João/Luiz, Paulo/Glauco, Flávio/Henrique, Fabiano/Vitor, Eduardo/Ariel Zamberlan. (Confirmar se "Ariel Zamberlan" é você ou outro colega de mesmo nome — o Notion lista assim.)

---

## Aula 05 → Java web com Spring

Muda de stack: sai de Servlet/JSP puro e entra **Spring Boot** para o resto da disciplina.

### Conceitos iniciais

- O que é Spring, setup do projeto (Spring Initializr) e teste de ambiente.
- Primeiro Controller e primeiro Model.

### Controller inicial (sem banco, lista fixa em memória)

```java
package com.example.projeto.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.projeto.models.UserModel;

@RestController
@RequestMapping(value = "/users")
public class UserController {

    @RequestMapping(method = RequestMethod.GET)
    public List<UserModel> getAllUsers() {
        UserModel u1 = new UserModel(1, "Fulano");
        UserModel u2 = new UserModel(2, "Beltrao");

        List<UserModel> usuarios = new ArrayList<>();
        usuarios.add(u1);
        usuarios.add(u2);

        return usuarios;
    }
}
```

> É possível ter vários métodos `@GetMapping` na mesma classe, desde que cada um mapeie um caminho diferente (senão dá conflito de rota):
> ```java
> @GetMapping("/users")
> public List<Usuario> listarUsuarios() { ... }
>
> @GetMapping("/users/{id}")
> public Usuario buscarUsuarioPorId(@PathVariable Long id) { ... }
> ```
> Também dá pra mapear múltiplos caminhos pro mesmo método com um array: `@GetMapping({"/home", "/"})`.

### Começando com JPA (Java Persistence API)

Dependências (`pom.xml`):

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
    <version>3.5.3</version>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>
```

`application.properties`:

```properties
spring.application.name=demo

# Datasource configuration
spring.datasource.url=jdbc:mysql://localhost:3306/projetoimobiliaria?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=

# JPA/Hibernate properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true
```

### Model adaptado para JPA

```java
package com.example.demo.models;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class UserModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nome;

    public UserModel() {};

    public UserModel(int id, String nome) {
        super();
        this.id = id;
        this.nome = nome;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = super.hashCode();
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((nome == null) ? 0 : nome.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!super.equals(obj)) return false;
        if (getClass() != obj.getClass()) return false;
        UserModel other = (UserModel) obj;
        if (id == null) {
            if (other.id != null) return false;
        } else if (!id.equals(other.id)) return false;
        if (nome == null) {
            if (other.nome != null) return false;
        } else if (!nome.equals(other.nome)) return false;
        return true;
    }
}
```

### Repository

O `Repository` abstrai a persistência: geralmente é uma interface que estende `JpaRepository`/`CrudRepository`, que já dá os métodos de CRUD prontos. Desacopla regra de negócio de acesso a dados.

### Controller com Repository + CRUD completo

```java
package com.example.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.models.UserModel;
import com.example.demo.repositories.UserRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(value = "/users")
public class UserController {

    @Autowired
    UserRepository repository;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<List<UserModel>> getAllUsers() {
        List<UserModel> usuarios = repository.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(usuarios);
    }

    @PostMapping()
    public ResponseEntity<UserModel> createUser(@RequestBody UserModel user) {
        UserModel savedUser = repository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserModel> getUserById(@PathVariable int id) {
        Optional<UserModel> user = repository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserModel> updateUser(@PathVariable int id, @RequestBody UserModel dados) {
        Optional<UserModel> usuario = repository.findById(id);
        if (usuario.isPresent()) {
            UserModel usuarioExistente = usuario.get();
            usuarioExistente.setNome(dados.getNome());
            repository.save(usuarioExistente);
            return ResponseEntity.ok(usuarioExistente);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        Optional<UserModel> usuario = repository.findById(id);
        if (usuario.isPresent()) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
```

- `ResponseEntity`: representa a resposta HTTP completa (status, headers, body).
- POST de teste: body `{"nome":"João"}`.
- GET por id: `http://localhost:8080/users/1`.

---

## Aula 06 → Continuação - DTO

> Conteúdo completo no Notion (arquitetura em camadas, refatoração do CRUD de usuário e DTOs). Variante "com Lombok" do `UserModel` mencionada, sem código publicado.

### Visão geral da arquitetura em camadas

- **Clientes** (verde): aplicações externas (web, mobile etc.) que consomem a API via HTTP.
- **Rest Controller**: recebe as requisições HTTP, valida entrada, encaminha pro Service. Não deve ter regra de negócio — é só a "ponte" entre cliente e back-end.
- **Service**: concentra a lógica de negócio (regras, validações, workflows). Processa dados vindos do controller e chama o repository quando precisa. Boa prática: evitar acoplamento a tecnologias específicas aqui.
- **Domain/Model**: entidades de negócio, mapeiam as tabelas do banco.
- **Repository**: centraliza acesso ao banco (CRUD). Chamado pelos services.
- **Banco de dados** (amarelo): armazenamento persistente.

### UserModel (v1, com campos novos: email, tipo, senha)

```java
import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class UserModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Integer id;

    private String nome;
    private String email;
    private String tipo;
    private String senha;

    public UserModel() {};

    public UserModel(int id, String nome, String email, String tipo, String senha) {
        super();
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.tipo = tipo;
        this.senha = senha;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((nome == null) ? 0 : nome.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (getClass() != obj.getClass()) return false;
        UserModel other = (UserModel) obj;
        if (id == null) {
            if (other.id != null) return false;
        } else if (!id.equals(other.id)) return false;
        if (nome == null) {
            if (other.nome != null) return false;
        } else if (!nome.equals(other.nome)) return false;
        return true;
    }
}
```

> Notion menciona uma variante "com Lombok" (reduz o boilerplate de getters/setters/equals/hashCode) mas não publicou o código dessa versão ainda.

### UserService

```java
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.imobiliaria.models.UserModel;
import com.example.imobiliaria.repositories.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    public List<UserModel> getAll() {
        return repository.findAll();
    }

    public UserModel find(Integer id) {
        Optional<UserModel> model = repository.findById(id);
        return model.orElse(null);
    }

    public UserModel insert(UserModel model) {
        return repository.save(model);
    }

    public UserModel update(UserModel model) {
        try {
            UserModel usuarioExistente = find(model.getId());
            if (usuarioExistente == null) {
                return null;
            }
            if (model.getNome() != null) usuarioExistente.setNome(model.getNome());
            if (model.getEmail() != null) usuarioExistente.setEmail(model.getEmail());
            if (model.getTipo() != null) usuarioExistente.setTipo(model.getTipo());
            if (model.getSenha() != null) usuarioExistente.setSenha(model.getSenha());
            return repository.save(usuarioExistente);
        } catch (Exception e) {
            return null;
        }
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }
}
```

### UserController (agora delegando pro Service, não direto pro Repository)

```java
import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.imobiliaria.models.UserModel;
import com.example.imobiliaria.services.UserService;

@RestController
@RequestMapping(value = "/users")
public class UserController {

    @Autowired
    private UserService service;

    @GetMapping()
    public ResponseEntity<List<UserModel>> getAllUsers() {
        return ResponseEntity.status(HttpStatus.OK).body(service.getAll());
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<UserModel> find(@PathVariable Integer id) {
        return ResponseEntity.status(HttpStatus.OK).body(service.find(id));
    }

    @PostMapping
    public ResponseEntity<Void> insert(@RequestBody UserModel model) {
        model = service.insert(model);
        URI uri = ServletUriComponentsBuilder
            .fromCurrentRequest().path("/{id}")
            .buildAndExpand(model.getId()).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Void> update(@RequestBody UserModel model, @PathVariable Integer id) {
        model.setId(id);
        service.update(model);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

### DTOs

DTO (Data Transfer Object): objeto simples que carrega dados entre camadas sem expor a entidade. Problema do código acima: o `GET /users` devolve a `senha` no JSON.

#### UserDTO (pacote `dtos`)

```java
@Getter
@Setter
public class UserDTO {
    private Integer id;
    private String nome;
    private String email;
    private String tipo;

    public UserDTO() {}

    public UserDTO(UserModel model) {   // sem senha
        this.id = model.getId();
        this.nome = model.getNome();
        this.email = model.getEmail();
        this.tipo = model.getTipo();
    }

    public UserDTO(Integer id, String nome, String email, String tipo) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.tipo = tipo;
    }
}
```

#### UserController com DTO

```java
@GetMapping()
public ResponseEntity<List<UserDTO>> getAllUsers() {
    List<UserDTO> list = service.getAll().stream()
        .map(UserDTO::new).collect(Collectors.toList());
    return ResponseEntity.status(HttpStatus.OK).body(list);
}

@GetMapping(value = "/{id}")
public ResponseEntity<UserDTO> find(@PathVariable Integer id) {
    return ResponseEntity.status(HttpStatus.OK).body(new UserDTO(service.find(id)));
}

@PostMapping
public ResponseEntity<Void> insert(@RequestBody UserDTO dto) {
    UserModel model = service.insert(dto);
    URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
        .buildAndExpand(model.getId()).toUri();
    return ResponseEntity.created(uri).build();
}

@PutMapping(value = "/{id}")
public ResponseEntity<Void> update(@RequestBody UserDTO dto, @PathVariable Integer id) {
    dto.setId(id);
    service.update(dto);
    return ResponseEntity.noContent().build();
}
```

#### UserService (métodos novos)

```java
public UserModel insert(UserDTO dto) {
    UserModel model = new UserModel();
    model.setNome(dto.getNome());
    model.setEmail(dto.getEmail());
    model.setTipo(dto.getTipo());
    return repository.save(model);
}

public UserModel update(UserDTO dto) {
    UserModel model = find(dto.getId());
    if (model == null) return null;
    model.setEmail(dto.getNome());   // ← bug do material
    model.setEmail(dto.getEmail());
    model.setTipo(dto.getTipo());
    return repository.save(model);
}
```

> ⚠️ Bug no material: `model.setEmail(dto.getNome())` é chamado antes de `setEmail(dto.getEmail())` — o certo é `model.setNome(dto.getNome())`. Como o email é sobrescrito na linha seguinte, o efeito é o **nome nunca ser atualizado** no PUT. Corrigir ao copiar.

#### Alternativa para dados sensíveis

Quando o objeto tem poucas informações e nenhum relacionamento, dá pra não criar DTO e esconder o campo direto na entidade:

```java
@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
private String senha;
```

`WRITE_ONLY`: aceita a senha na entrada (POST/PUT) e não a devolve na saída.

---

## Aula 07 → Funcionalidades para Bairro - Pageable

CRUD completo de `Bairro` e `TipoImovel` no padrão model/repository/service/controller da Aula 06, com paginação via `Pageable`. Models usam **Lombok** (`@Getter`/`@Setter`) — precisa da dependência `lombok` no `pom.xml`. Pacote base: `com.example.demo`.

### BairroModel

```java
package com.example.demo.models;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "bairros")
@Getter
@Setter
public class BairroModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Integer id;

    private String nome;
    private String cidade;
    private String estado;
    private String cepInicial;

    public BairroModel() {};

    public BairroModel(Integer id, String nome, String cidade, String estado, String cepInicial) {
        super();
        this.id = id;
        this.nome = nome;
        this.cidade = cidade;
        this.estado = estado;
        this.cepInicial = cepInicial;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((nome == null) ? 0 : nome.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (getClass() != obj.getClass()) return false;
        BairroModel other = (BairroModel) obj;
        if (id == null) {
            if (other.id != null) return false;
        } else if (!id.equals(other.id)) return false;
        if (nome == null) {
            if (other.nome != null) return false;
        } else if (!nome.equals(other.nome)) return false;
        return true;
    }
}
```

### BairroRepository

```java
package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.BairroModel;

public interface BairroRepository extends JpaRepository<BairroModel, Integer> {

}
```

### BairroService

```java
package com.example.demo.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.models.BairroModel;
import com.example.demo.repositories.BairroRepository;

@Service
public class BairroService {

    @Autowired
    private BairroRepository repository;

    public List<BairroModel> getAll() {
        List<BairroModel> list = repository.findAll();
        return list;
    }

    public Page<BairroModel> getAll(Pageable pageable) {
        Page<BairroModel> list = repository.findAll(pageable);
        return list;
    }

    public BairroModel find(Integer id) {
        Optional<BairroModel> model = repository.findById(id);
        return model.orElse(null);
    }

    public BairroModel insert(BairroModel model) {
        return repository.save(model);
    }

    public BairroModel update(BairroModel model) {
        try {
            if (find(model.getId()) != null) {
                return repository.save(model);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }
}
```

### BairroController

```java
package com.example.demo.controllers;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.demo.models.BairroModel;
import com.example.demo.services.BairroService;

@RestController
@RequestMapping(value = "/bairros")
public class BairroController {

    @Autowired
    private BairroService service;

    @GetMapping()
    public ResponseEntity<List<BairroModel>> getAllBairros() {
        List<BairroModel> list = service.getAll();
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @GetMapping("/bairros-page")
    public Page<BairroModel> getPosts(Pageable pageable) {
        return service.getAll(pageable);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<BairroModel> find(@PathVariable Integer id) {
        BairroModel model = service.find(id);
        return ResponseEntity.status(HttpStatus.OK).body(model);
    }

    @PostMapping
    public ResponseEntity<Void> insert(@RequestBody BairroModel model) {
        model = service.insert(model);
        // return new ResponseEntity(model, HttpStatus.CREATED);
        URI uri = ServletUriComponentsBuilder
            .fromCurrentRequest().path("/{id}")
            .buildAndExpand(model.getId()).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Void> update(@RequestBody BairroModel model, @PathVariable Integer id) {
        model.setId(id);
        model = service.update(model);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

Paginação:

```
http://localhost:8080/bairros/bairros-page?page=0&size=5&sort=id,DESC
```

### Funcionalidades para Tipo Imóvel

#### TipoImovelModel

```java
package com.example.demo.models;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tipos_imoveis")
@Getter
@Setter
public class TipoImovelModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Integer id;

    private String nome;
    private String descricao;

    public TipoImovelModel() {};

    public TipoImovelModel(int id, String nome, String descricao) {
        super();
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((nome == null) ? 0 : nome.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (getClass() != obj.getClass()) return false;
        TipoImovelModel other = (TipoImovelModel) obj;
        if (id == null) {
            if (other.id != null) return false;
        } else if (!id.equals(other.id)) return false;
        if (nome == null) {
            if (other.nome != null) return false;
        } else if (!nome.equals(other.nome)) return false;
        return true;
    }
}
```

#### TipoImovelRepository

```java
package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.TipoImovelModel;

public interface TipoImovelRepository extends JpaRepository<TipoImovelModel, Integer> {

}
```

#### TipoImovelService

```java
package com.example.demo.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.models.TipoImovelModel;
import com.example.demo.repositories.BairroRepository;
import com.example.demo.repositories.TipoImovelRepository;

@Service
public class TipoImovelService {

    @Autowired
    private TipoImovelRepository repository;

    public List<TipoImovelModel> getAll() {
        List<TipoImovelModel> list = repository.findAll();
        return list;
    }

    public Page<TipoImovelModel> getAll(Pageable pageable) {
        Page<TipoImovelModel> list = repository.findAll(pageable);
        return list;
    }

    public TipoImovelModel find(Integer id) {
        Optional<TipoImovelModel> model = repository.findById(id);
        return model.orElse(null);
    }

    public TipoImovelModel insert(TipoImovelModel model) {
        return repository.save(model);
    }

    public TipoImovelModel update(TipoImovelModel model) {
        try {
            if (find(model.getId()) != null) {
                return repository.save(model);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }
}
```

> Import `BairroRepository` não é usado (sobra de copiar/colar do material) — pode remover.

#### TipoImovelController

```java
package com.example.demo.controllers;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.demo.models.TipoImovelModel;
import com.example.demo.services.BairroService;
import com.example.demo.services.TipoImovelService;

@RestController
@RequestMapping(value = "/tiposimoveis")
public class TipoImovelController {

    @Autowired
    private TipoImovelService service;

    @GetMapping()
    public ResponseEntity<List<TipoImovelModel>> getAllBairros() {
        List<TipoImovelModel> list = service.getAll();
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @GetMapping("/tipos-page")
    public Page<TipoImovelModel> getPosts(Pageable pageable) {
        return service.getAll(pageable);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<TipoImovelModel> find(@PathVariable Integer id) {
        TipoImovelModel model = service.find(id);
        return ResponseEntity.status(HttpStatus.OK).body(model);
    }

    @PostMapping
    public ResponseEntity<Void> insert(@RequestBody TipoImovelModel model) {
        model = service.insert(model);
        // return new ResponseEntity(model, HttpStatus.CREATED);
        URI uri = ServletUriComponentsBuilder
            .fromCurrentRequest().path("/{id}")
            .buildAndExpand(model.getId()).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Void> update(@RequestBody TipoImovelModel model, @PathVariable Integer id) {
        model.setId(id);
        model = service.update(model);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

> Import `BairroService` não é usado; método `getAllBairros` mantém o nome copiado do Bairro (funciona, só o nome é enganoso).

Paginação:

```
http://localhost:8080/tiposimoveis/tipos-page?page=0&size=5&sort=id,DESC
```

---

## Aula 08 → Funcionalidades para Imóvel e relacionamentos

Nova entidade `Imovel`, com relacionamentos `@ManyToOne` para `TipoImovel` e `Bairro`. Pacote base: `com.example.demo`. Pré-requisito: `TipoImovelModel` e `BairroModel` (Aula 07).

### ImovelModel

```java
package com.example.demo.models;

import java.io.Serializable;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "imoveis")
@Getter
@Setter
public class ImovelModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String titulo;

    @Column(columnDefinition = "text")
    private String descricao;

    @Column(name = "preco_venda", precision = 15, scale = 2)
    private BigDecimal precoVenda;

    @Column(name = "preco_aluguel", precision = 15, scale = 2)
    private BigDecimal precoAluguel;

    private String finalidade;

    private String status;

    private Integer dormitorios;

    private Integer banheiros;

    private Integer garagem;

    @Column(name = "area_total", precision = 15, scale = 2)
    private BigDecimal areaTotal;

    @Column(name = "area_construida", precision = 15, scale = 2)
    private BigDecimal areaConstruida;

    // Endereço
    private String endereco;
    private String numero;
    private String complemento;
    private String cep;

    @Column(columnDefinition = "text")
    private String caracteristicas;

    private Boolean destaque;

    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_imovel_id")
    private TipoImovelModel tipoImovel;

    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bairro_id")
    private BairroModel bairro;

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (getClass() != obj.getClass()) return false;
        ImovelModel other = (ImovelModel) obj;
        if (id == null) {
            if (other.id != null) return false;
        } else if (!id.equals(other.id)) return false;
        return true;
    }
}
```

- Valores monetários e áreas em `BigDecimal` (`precision = 15, scale = 2` → `DECIMAL(15,2)`), não `double`.
- `@Column(columnDefinition = "text")` em `descricao` e `caracteristicas` → coluna `TEXT` em vez de `VARCHAR(255)`.
- `name = "preco_venda"` etc. é explícito, mas é o mesmo nome que a naming strategy padrão do Spring já geraria a partir do camelCase.
- `hashCode`/`equals` só pelo `id` (diferente de Bairro/TipoImovel, que usam `id` + `nome`).
- `@ManyToOne`: vários imóveis → um tipo / um bairro. `@JoinColumn`: nome da FK na tabela `imoveis`.
- `FetchType.LAZY`: só carrega o relacionado quando acessado.
- `@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})`: evita erro de serialização do proxy lazy do Hibernate ao devolver JSON.

### ImovelRepository

```java
package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.ImovelModel;

public interface ImovelRepository extends JpaRepository<ImovelModel, Integer> {

}
```

### ImovelService

Injeção via **construtor** (em vez de `@Autowired` no campo, como na Aula 06).

```java
package com.example.demo.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.models.ImovelModel;
import com.example.demo.repositories.ImovelRepository;

@Service
public class ImovelService {
    private final ImovelRepository repository;

    public ImovelService(ImovelRepository repository) {
        this.repository = repository;
    }

    public List<ImovelModel> getAll() {
        List<ImovelModel> list = repository.findAll();
        return list;
    }

    public ImovelModel find(Integer id) {
        Optional<ImovelModel> model = repository.findById(id);
        return model.orElse(null);
    }

    public ImovelModel insert(ImovelModel model) {
        return repository.save(model);
    }

    public ImovelModel update(ImovelModel model) {
        try {
            if (find(model.getId()) != null) {
                return repository.save(model);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }
}
```

### ImovelController

```java
package com.example.demo.controllers;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.demo.models.ImovelModel;
import com.example.demo.services.ImovelService;

@RestController
@RequestMapping("/imoveis")
public class ImovelController {

    @Autowired
    private ImovelService service;

    @GetMapping()
    public ResponseEntity<List<ImovelModel>> getAll() {
        List<ImovelModel> list = service.getAll();
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<ImovelModel> find(@PathVariable Integer id) {
        ImovelModel model = service.find(id);
        if (model != null) {
            return ResponseEntity.status(HttpStatus.OK).body(model);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    public ResponseEntity<Void> insert(@RequestBody ImovelModel model) {
        model = service.insert(model);
        // return new ResponseEntity(model, HttpStatus.CREATED);
        URI uri = ServletUriComponentsBuilder
            .fromCurrentRequest().path("/{id}")
            .buildAndExpand(model.getId()).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Void> update(@RequestBody ImovelModel model, @PathVariable Integer id) {
        try {
            model.setId(id);
            model = service.update(model);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

> ⚠️ No `update`, o service devolve `null` (não lança exceção) quando o id não existe — então o `catch` nunca dispara e o PUT retorna 204 mesmo pra id inexistente. Correção (já aplicada no repo): `if (service.update(model) == null) return ResponseEntity.notFound().build();`.

### JSON para teste (POST `/imoveis`)

```json
{
  "titulo": "Casa ampla com piscina",
  "descricao": "Excelente casa em bairro tranquilo, próximo a escolas e comércios.",
  "precoVenda": 850000.00,
  "precoAluguel": 3500.00,
  "finalidade": "Residencial",
  "status": "Disponível",
  "dormitorios": 3,
  "banheiros": 2,
  "garagem": 2,
  "areaTotal": 300.50,
  "areaConstruida": 180.75,
  "endereco": "Rua das Flores",
  "numero": "123",
  "complemento": "Casa 02",
  "cep": "12345-678",
  "caracteristicas": "Piscina, Churrasqueira, Jardim",
  "destaque": true,
  "tipoImovel": { "id": 1 },
  "bairro": { "id": 1 }
}
```

`tipoImovel` e `bairro` vão só com o `id` — precisam existir no banco antes (id 1 em cada tabela), senão dá erro de FK.

---

## Aula 09 → Uploads de fotos

Nova entidade `FotoImovel` (`@ManyToOne` → `Imovel`), upload via `multipart/form-data`, arquivo salvo em disco e caminho salvo no banco. Pacote base: `com.example.demo`.

### application.properties

A partir desta aula o material usa o banco **`restaurante`** (mesmo do repo).

```properties
spring.application.name=demo

# Datasource configuration
spring.datasource.url=jdbc:mysql://localhost:3306/restaurante?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=

# JPA/Hibernate properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
#spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true

#Uploads
app.upload-dir=./uploads
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
spring.servlet.multipart.enabled=true
```

- `app.upload-dir`: propriedade customizada, lida no service com `@Value("${app.upload-dir}")`. `./uploads` é relativo ao diretório de onde a app roda (rodando `mvn spring-boot:run` na pasta do projeto → `aula05-08-spring-imoveis/uploads/`).
- `max-file-size` / `max-request-size`: acima de 10MB o Spring rejeita antes de chegar no controller (`MaxUploadSizeExceededException`).

### FotoImovelModel

```java
package com.example.demo.models;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "fotos_imoveis")
@Getter
@Setter
public class FotoImovelModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "imovel_id", nullable = false)
    private ImovelModel imovel;

    private String nomeArquivo;
    private String caminho;
    private Boolean capa;
    private Integer ordem;

    public FotoImovelModel() {}

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (getClass() != obj.getClass()) return false;
        FotoImovelModel other = (FotoImovelModel) obj;
        if (id == null) {
            if (other.id != null) return false;
        } else if (!id.equals(other.id)) return false;
        return true;
    }
}
```

- `@ManyToOne` sem `fetch` → **EAGER** (padrão do `ManyToOne`), diferente do `LAZY` usado no `ImovelModel`. Sem `@JsonIgnoreProperties` também: a resposta do POST devolve o imóvel inteiro dentro da foto.
- `nullable = false` na FK: foto sempre pertence a um imóvel.
- `capa` / `ordem` não são preenchidos no upload → ficam `null` (é o exercício da aula).

### FotoImovelRepository

```java
package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.FotoImovelModel;

public interface FotoImovelRepository extends JpaRepository<FotoImovelModel, Integer> {

}
```

### FotoImovelService

```java
package com.example.demo.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dtos.FotoImovelDTO;
import com.example.demo.models.FotoImovelModel;
import com.example.demo.models.ImovelModel;
import com.example.demo.repositories.FotoImovelRepository;
import com.example.demo.repositories.ImovelRepository;

@Service
public class FotoImovelService {
    @Autowired
    private FotoImovelRepository fotoImovelRepository;

    @Autowired
    private ImovelRepository imovelRepository;

    @Value("${app.upload-dir}")
    private String uploadDir;

    public FotoImovelModel salvar(MultipartFile arquivo, Integer imovelId) {

        ImovelModel imovel = imovelRepository.findById(imovelId)
            .orElseThrow(() -> new RuntimeException("Imóvel não encontrado: " + imovelId));

        try {
            // 1 -> criar a pasta do imóvel
            Path pasta = Paths.get(uploadDir, String.valueOf(imovelId));
            Files.createDirectories(pasta);

            // 2 -> gerar nome único
            String original = StringUtils.cleanPath(arquivo.getOriginalFilename());
            String nomeFinal = UUID.randomUUID() + "_" + original;
            Path destino = pasta.resolve(nomeFinal);

            // 3 -> salvar o arquivo no disco
            arquivo.transferTo(destino);

            // 4 -> criar o model e salvar no banco
            FotoImovelModel model = new FotoImovelModel();
            model.setNomeArquivo(nomeFinal);
            model.setCaminho(destino.toString());
            model.setImovel(imovel);
            // outros campos

            return fotoImovelRepository.save(model);

        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar arquivo", e);
        }
    }
}
```

- Estrutura em disco: `uploads/<imovelId>/<uuid>_<nomeOriginal>`. O UUID evita sobrescrever arquivo com mesmo nome.
- `StringUtils.cleanPath` normaliza o nome (remove `..`, barras duplicadas).
- `caminho` guarda o path relativo (`uploads/1/...`), não absoluto — depende de onde a app roda.
- ⚠️ `import com.example.demo.dtos.FotoImovelDTO` — essa classe **não existe** no material (nem no repo). Não compila: remover o import ou criar o DTO. `List` também não é usado.

### FotoImovelController

```java
package com.example.demo.controllers;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.models.FotoImovelModel;
import com.example.demo.services.FotoImovelService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Part;

@RestController
@RequestMapping("/fotos")
public class FotoImovelController {
    @Autowired
    private FotoImovelService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<FotoImovelModel> salvar(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("imovelId") Integer imovelId) {
        try {
            if (arquivo.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            FotoImovelModel fotoImovelModel = service.salvar(arquivo, imovelId);

            return ResponseEntity.status(HttpStatus.CREATED).body(fotoImovelModel);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

- Só tem o POST. Imóvel inexistente cai no `catch` → **500**, não 404.
- Imports não usados: `File`, `IOException`, `LocalDateTime`, `List`, `UUID`, `DeleteMapping`, `GetMapping`, `PathVariable`, `RequestBody`, `RequestPart`, `ObjectMapper`, `HttpServletRequest`, `Part`.
- ⚠️ `com.fasterxml.jackson.databind.ObjectMapper`: o repo é Spring Boot 4 (Jackson 3, pacote `tools.jackson.databind`). Provavelmente esse import nem resolve lá — não confirmei rodando o build. Como não é usado, remover resolve.

### Teste (Postman/Insomnia)

`POST http://localhost:8080/fotos` → Body **form-data**:

| Key | Tipo | Valor |
|---|---|---|
| `arquivo` | File | qualquer imagem ≤ 10MB |
| `imovelId` | Text | `1` (precisa existir em `imoveis`) |

Retorno esperado: `201` com o JSON da foto (incluindo o imóvel). Arquivo aparece em `uploads/1/`.

### Exercício proposto (aula 09)

1. Exclusão de foto.
2. Edição de foto.
3. Método para tornar a foto destaque (capa).

> Não especificado no material: se a exclusão deve apagar o arquivo do disco além da linha do banco, e se "capa" deve ser única por imóvel (marcar uma desmarca as outras). O mais coerente é sim pros dois — confirmar com o professor.

---

## Aula 10 → Email

Envio de email via SMTP com `spring-boot-starter-mail`, testando com o **Mailgun**. Três partes: email em texto puro, email HTML com template **Thymeleaf**, e um extra que gera o texto do email com o **Gemini**.

### Email - Texto

#### Dependência (`pom.xml`)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

Sem `<version>`: quem define é o `spring-boot-starter-parent` (4.1.1 no repo).

#### Configuração (`application.properties`)

```properties
#email
spring.mail.host=smtp.mailgun.org
spring.mail.port=587
spring.mail.username=
spring.mail.password=
spring.mail.properties.mail.smtp.auth=true

spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.debug=true
```

- Porta `587` + `starttls.*`: a conexão começa em texto puro e sobe pra TLS. `required=true` aborta se o servidor não oferecer TLS.
- `username` / `password`: credenciais **SMTP** do domínio no Mailgun (não é o login do site). O username tem cara de `postmaster@sandbox<...>.mailgun.org`.
- `mail.debug=true`: loga toda a conversa SMTP no console. ⚠️ Isso inclui a linha de `AUTH` em base64 — dá pra decodificar a senha a partir do log. Desligar depois de testar.
- ⚠️ Não commitar usuário/senha no repo (é público). Usar variável de ambiente: `spring.mail.username=${MAIL_USERNAME}` e `spring.mail.password=${MAIL_PASSWORD}`.

#### Testar com o Mailgun

1. Criar conta no Mailgun e abrir o domínio sandbox que ele gera.
2. Pegar as credenciais SMTP do domínio e colocar no `application.properties` (ou nas variáveis de ambiente).
3. Domínio sandbox só entrega pra **destinatários autorizados**: cadastrar teu email como recipient autorizado e confirmar o convite que chega na caixa. Sem isso o envio falha (não confirmei o limite atual do plano gratuito — conferir no painel).

### Email - Template (Thymeleaf)

#### Dependência (`pom.xml`)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

#### Template HTML

Criar em `src/main/resources/templates/email/template.html`:

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
</head>
<body style="">
    <div style="">
        <h2 style="">
            Olá, <span th:text="${nome}">Usuário</span>!
        </h2>

        <p>Seu cadastro foi realizado com sucesso.</p>

        <p>Seus itens:</p>
        <ul>
            <li th:each="item : ${itens}"
                th:text="${item}">Item
            </li>
        </ul>

        <a th:href="${link}"
           style="">
            Teste de link
        </a>
    </div>
</body>
</html>
```

- `th:text="${nome}"`: troca o texto do elemento pelo valor da variável. O "Usuário" fixo só aparece se abrir o HTML direto no navegador (protótipo).
- `th:each`: repete o `<li>` pra cada item da lista `itens`.
- `th:href`: monta o link a partir da variável `link`.
- Os `style=""` estão vazios no material. Em email, CSS tem que ser **inline** (`style="..."`): a maioria dos clientes de email ignora `<style>` externo.

#### EmailService

```java
@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    //@Async
    public void enviarEmailTexto(
            String para,
            String assunto,
            String corpo) {

        SimpleMailMessage msg = new SimpleMailMessage();

        msg.setFrom("seuemail@gmail.com");
        msg.setTo(para);
        msg.setSubject(assunto);
        msg.setText(corpo);

        mailSender.send(msg);
    }

    public void enviarEmailComTemplate(String para, String assunto,
                                       String template,
                                       Map<String, Object> variaveis)
            throws MessagingException {

        Context context = new Context();
        context.setVariables(variaveis);

        String html = templateEngine.process(template, context);

        MimeMessage mime = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
        helper.setFrom("seuemail@gmail.com");
        helper.setTo(para);
        helper.setSubject(assunto);
        helper.setText(html, true);

        mailSender.send(mime);
    }
}
```

O material não traz `package` nem imports. Os que faltam:

```java
package com.example.demo.services;

import java.util.Map;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
```

- `enviarEmailTexto`: `SimpleMailMessage`, só texto puro.
- `enviarEmailComTemplate`: o Thymeleaf renderiza o template com as variáveis → string HTML → `MimeMessage`. `MimeMessageHelper(mime, true, "UTF-8")`: `true` = multipart (permite anexo), `UTF-8` pra acento não quebrar. `setText(html, true)`: o `true` diz que o corpo é HTML.
- `templateEngine.process("email/template", ...)` resolve pra `templates/email/template.html` (prefixo e sufixo padrão do Spring).
- `//@Async`: se descomentar, o envio roda em outra thread e o endpoint responde na hora. Só funciona com `@EnableAsync` numa classe de config (ex. `DemoApplication`), e aí uma exceção no envio não chega mais no `catch` do controller.
- ⚠️ `setFrom("seuemail@gmail.com")`: trocar pelo remetente do domínio do Mailgun (`postmaster@<teu-sandbox>.mailgun.org`). Com um `@gmail.com` saindo pelo SMTP do Mailgun, a autenticação do domínio (SPF/DMARC) não bate e o email tende a ser rejeitado ou cair no spam.

#### Utilização (controller)

```java
package com.example.imobiliaria.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.imobiliaria.services.EmailService;

@RestController
@RequestMapping("/email")
public class EnviarEmailController {

    @Autowired
    private EmailService service;

    @GetMapping
    public ResponseEntity<String> enviar() {
        try {
            //service.enviarEmailTexto("ederson.bastiani@iffarroupilha.edu.br", "Teste", "Olá, este é um teste!");

            service.enviarEmailComTemplate(
                "destinatário",
                "Bem-vindo!",
                "email/template",
                Map.of(
                    "nome", "Maria",
                    "itens", List.of("Plano Pro", "Suporte 24h"),
                    "link", "https://meusite.com"
                ));

            return ResponseEntity.ok("Enviado");
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
```

- Pacote `com.example.imobiliaria` (projeto do professor) → no repo é `com.example.demo`.
- Imports não usados: `PostMapping`, `RequestParam`.
- `"destinatário"`: trocar por um email autorizado no sandbox.
- Testar: `GET http://localhost:8080/email` → resposta `Enviado` ou a mensagem de erro.
- Erro de envio volta como `400` (`badRequest`). Na real é erro do servidor (500), mas pra teste serve: a mensagem aparece no corpo.

### Extra - Email com texto pelo Gemini

Gera o corpo do email com a API do Gemini e manda com `enviarEmailTexto`.

#### Configuração (`application.properties`)

```properties
gemini.api.key=
gemini.model=gemini-3.8-flash
```

#### Dependência (`pom.xml`)

```xml
<dependency>
    <groupId>com.google.genai</groupId>
    <artifactId>google-genai</artifactId>
    <version>1.57.0</version>
</dependency>
```

Aqui precisa de `<version>`: não é gerenciado pelo Spring Boot.

#### Código

```java
package com.example.imobiliaria.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.imobiliaria.services.EmailService;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

@RestController
@RequestMapping("/email")
public class EnviarEmailController {

    @Autowired
    private EmailService service;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    @GetMapping
    public ResponseEntity<String> enviar() {
        try {
            String prompt = """
                    Escreva um e-mail curto e cordial, em português, informando que
                    o imóvel está disponível para visita.
                    Responda apenas com o texto do e-mail, em texto puro, sem markdown e sem assunto.
                    """;

            Client client = Client.builder().apiKey(apiKey).build();
            GenerateContentResponse response =
                client.models.generateContent(model, prompt, null);
            String texto = response.text();

            service.enviarEmailTexto(
                "destinaário", "Teste", texto);

            return ResponseEntity.ok("Enviado");
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
```

- É uma **versão alternativa** do mesmo `EnviarEmailController` (mesmo nome de classe, mesmo `GET /email`). Não dá pra ter os dois: ou substitui, ou muda o mapping (ex. `@GetMapping("/gemini")`).
- `"""..."""`: text block (Java 15+), string de várias linhas.
- `generateContent(model, prompt, null)`: o `null` é a config de geração (temperatura etc.), usa o padrão.
- `Client` criado a cada requisição: funciona, mas o normal seria um `@Bean` reaproveitado.
- ⚠️ `gemini.api.key` também não vai pro repo: `gemini.api.key=${GEMINI_API_KEY}`. A chave sai do Google AI Studio.
- Não confirmei se `gemini-3.8-flash` e a versão `1.57.0` existem com esses nomes exatos (posteriores ao que eu sei). Se der erro de modelo não encontrado, conferir o nome na doc do Gemini.

---

## Aula 11 → Autenticação e autorização com JWT

Atividade em PDF (não está no Notion). Sugestão do professor: dependências `spring-boot-starter-security` e `com.auth0:java-jwt:4.4.0`. Feita no mesmo projeto (`aula05-08-spring-imoveis`), sem branch nova. Resolução e respostas em `RESPOSTAS.md` no repo.

### Rotas e permissões

| Rota | Acesso |
|---|---|
| `POST /public/register`, `POST /public/login` | público (email repetido no register → 409) |
| `GET /imoveis`, `GET /bairros`, `GET /tiposimoveis` | público |
| `POST /imoveis/sabermais/{id}` | público |
| `POST/PUT/DELETE /imoveis`, `/bairros`, `/tiposimoveis` | ADMIN |
| `PATCH /imoveis/{id}/status` (body `{"status":"VENDIDO"}`) | qualquer autenticado |
| `/users`, `/fotos-imoveis`, `/email` | ADMIN |

Sem token → 401; token válido sem permissão → 403.

### Implementação

- Stateless (sem sessão), CSRF desligado, `BCryptPasswordEncoder` no cadastro.
- Token HS256 (`java-jwt` 4.4.0) com claims `sub` (email), `role`, `iat`, `exp` (1h). Segredo em `jwt.secret=${JWT_SECRET:...}`, expiração em `jwt.expiration-ms`.
- Classes: `AuthController`, `JwtService` (`generateToken(UserModel)`, `parse()` → `DecodedJWT`), `JwtFilter` (`OncePerRequestFilter`, lê `Authorization: Bearer`), `SecurityConfig` (rotas + handlers 401/403 em JSON), `RegisterDTO`/`LoginDTO` (records).
- `TipoUsuario` ganhou `USER`; `UserRepository.findByEmail`; `UserService` aplica bcrypt.
- Banco: coluna `tipo` era ENUM no MySQL e não aceitava `USER` (500 no register) → `migration_jwt.sql`.
- Testes: `testar-jwt.sh` (curl, 9/9 ok), `jwt.insomnia.json`; token expirado/malformado → 401.

### Pontos de atenção

- `SecurityConfig` ainda **não libera CORS** para `http://localhost:4200` (precisa `.cors()` + permitir `OPTIONS`; `@CrossOrigin` sozinho não basta com Security).
- Perfis hoje: `USER`, `COMPRADOR`, `VENDEDOR`, `ADMIN`. Decidir qual é o "cliente" do Trabalho Final.

---

## Trabalho Final → Front-end da imobiliária (consome a API Spring das Aulas 05–11)

**Objetivo:** construir o front-end da imobiliária consumindo a API REST da disciplina.

### Regras gerais

- Trabalho **individual**; prazo de **4 semanas**, um checkpoint por semana.
- Tecnologia **sorteada**: React + Vite, Vue + Vite, React + Next ou Angular. Backend construído em aula.
- Entrega final: repositório GitHub com histórico de commits; README explicando como rodar; vídeo de demonstração de até 5 min; apresentação em aula.

### Tecnologia sorteada

**Ariel Dornelles da Silva → Angular.**

| Tecnologia | Alunos |
|---|---|
| Angular (4) | Ariel Dornelles da Silva, Arthur Fogaça Martins, Henrique Kahlmeier, Júlia Gabrieli Neves de Jesus |
| React + Vite (7) | Caetano Rossoni Souto, Carolina Hirschfeld Pavim, Diullian Miotto, Fabiano Heusner, Glauco Schneider, Leonardo Bronzatti Claudy, Vitor Machado Marques |
| React + Next (6) | Arthur Luft Zamberlan, Cauê Nunes de Lima, Douglas Martins Erdmann, Eduardo Baptista Aristimunho, Flávio Daniel Wehrmann Bastos, João Gabriel Schemmer Gressler |
| Vue + Vite (2) | Luiz Américo Tonel Valandro, Paulo Ricardo Costa Beber |

### Tabelas a adicionar no backend

| Tabela | Campos |
|---|---|
| `ofertas` | id do imóvel, id do usuário, tipo (aluguel ou venda), valor proposto, mensagem, status (`pendente`, `aceita`, `em espera`, `recusada`, `cancelada`), data de criação |
| `contratos` | id da oferta, pdf (ou caminho), status (`aguardando assinatura`, `assinado`, `cancelado`), data da assinatura, data da aprovação |
| `favoritos` | id do usuário, id do imóvel |

### Requisitos funcionais

**Área pública**
- Vitrine: cards com foto, tipo, bairro, cidade, valor e finalidade (aluguel/venda).
- Detalhe do imóvel.
- Entrar em contato: e-mail para a imobiliária com assunto e corpo já preenchidos (código, tipo, bairro e valor).
- Paginação com navegação entre páginas.
- Filtros por bairro, finalidade e faixa de preço, combináveis.
- Ordenação por preço, crescente e decrescente.
- Login com JWT, mensagens claras de validação, e cada perfil vai para a sua área inicial.

**Área privada — Cliente**
- Fazer oferta (aluguel ou venda) no detalhe do imóvel.
- Minhas ofertas, com situação (pendente, aceita, recusada).
- Favoritos: listar, adicionar, remover.
- Assinar contrato de uma oferta.
- Listar contratos com a situação.
- Logout (apaga o token).

**Área privada — Admin**
- CRUD de imóveis, bairros, tipos de imóveis e fotos, todos com confirmação antes de excluir.
- Gestão de usuários: cadastra, lista, busca por nome ou e-mail, edita, troca perfil, exclui com confirmação. **Admin não pode excluir a si mesmo.**
- Gestão de contratos: lista, baixa o pdf, aprova ou recusa e envia ao cliente (notificar por e-mail).
- Painel: totais (imóveis disponíveis, ofertas pendentes, contratos aguardando assinatura) e gráficos (imóveis por bairro, ofertas por situação, imóveis por finalidade).
- Gestão de ofertas: lista todas, filtra por situação, aceita ou recusa.

### Requisitos não funcionais

- Toda requisição autenticada envia `Authorization: Bearer <token>`.
- Rotas protegidas: digitar a URL de uma tela protegida não exibe a tela.
- Menu mostra só as opções do perfil logado.
- Formulários validam obrigatórios, e-mail e números antes de enviar.
- Toda tela que busca dados mostra "carregando", "sem resultados" e erro amigável (nunca JSON).
- Responsividade.
- Erros da API: **401** apaga o token e vai ao login; **403** "acesso negado"; **409** mostra a mensagem da regra de negócio vinda do backend; **404** item não encontrado.

### Regras de negócio

1. Só imóveis **disponíveis** recebem ofertas; reservado, alugado ou vendido não mostram "Fazer oferta".
2. Um cliente não pode ter duas ofertas **pendentes** para o mesmo imóvel.
3. Um imóvel pode receber ofertas de **vários clientes**.
4. **Aceitar** oferta → imóvel **reservado**; as outras ofertas pendentes vão para **em espera** automaticamente.
5. **Assinar** contrato → imóvel **alugado** ou **vendido** (conforme o tipo da oferta); as outras ofertas são **recusadas**.
6. Cliente desistiu → admin **cancela** o contrato e o imóvel volta a **disponível**.

### Fluxo de estados (derivado das regras)

| Evento | Imóvel | Oferta alvo | Demais ofertas |
|---|---|---|---|
| Cliente faz oferta | `disponível` | `pendente` | — |
| Admin aceita | `disponível → reservado` | `pendente → aceita` | `pendente → em espera` |
| Contrato assinado (aluguel) | `reservado → alugado` | `aceita` | `em espera → recusada` |
| Contrato assinado (venda) | `reservado → vendido` | `aceita` | `em espera → recusada` |
| Admin cancela contrato | `→ disponível` | `cancelada` / contrato `cancelado` | (regra não diz o que acontece com as "em espera") |

> Os status de oferta e contrato agora vêm do enunciado. A tabela de transições é derivação minha. `ImovelModel.status` é `String` livre no repo (ex.: `"Disponível"`) — padronizar (enum) antes de depender dele no front.

### Aula 1 — Setup e testes do backend

1. Sorteio da tecnologia (feito: Angular).
2. Colocar o backend no ar e **testar as regras de segurança** (agora = JWT da Aula 11).
3. Criar o projeto front-end.
4. Primeira chamada à API (listar imóveis).
5. Criar o repositório no GitHub e fazer o primeiro commit.

```bash
# backend
cd aula05-08-spring-imoveis && mvn spring-boot:run     # http://localhost:8080

# front-end
npm i -g @angular/cli
ng new imobiliaria-front --routing --style=scss
cd imobiliaria-front && ng serve                        # http://localhost:4200
```

- **CORS:** liberar `http://localhost:4200` no `SecurityConfig` (`.cors()` + permitir `OPTIONS`), ou usar `proxy.conf.json` no `ng serve`.
- **Referência cíclica:** hoje `GET /imoveis` (lista) **também quebra** (JSON truncado, "Document nesting depth (501)"). Corrigir antes da primeira chamada: `@JsonIgnore` em `BairroModel.imoveis` ou DTO.
- Primeira chamada: `provideHttpClient()` em `app.config.ts` + `GET http://localhost:8080/imoveis`.

### O que o backend ainda não tem

- Entidades `Oferta`, `Contrato`, `Favorito` + endpoints (criar/aceitar/recusar oferta, assinar/aprovar/cancelar contrato, favoritos) com as regras 2, 4, 5 e 6 no Service (`@Transactional`).
- Filtros (bairro, finalidade, faixa de preço), ordenação por preço e paginação em `/imoveis`.
- Endpoints de totais/gráficos do painel; upload/download de PDF do contrato; e-mail ao enviar contrato.
- Enum de status do imóvel; definir o perfil "cliente" (`USER` vs `COMPRADOR`).
- Admin não pode excluir a si mesmo (validar no backend também).

---

## Estado real do repositório (GitHub `2004ariel/JavaWeb`)

Fonte da verdade do código, assim como a seção do `ProjetoI` é para as aulas 1–2. Commit de referência: `44e5cdc` ("JWT: troca jjwt por java-jwt 4.4.0"). Histórico limpo, 9 commits, sem trailers do Claude.

| Pasta | Aulas | Conteúdo |
|---|---|---|
| raiz | 01–04 | Maven `war`, Servlet 6.1 / Tomcat 11, JDBC, banco `cantina`. Pacotes `model`/`dao`/`controller`/`filter`/`util`. Gera `target/aula03.war` → `http://localhost:8080/aula03/` |
| `aula05-08-spring-imoveis/` | 05–11 | Spring Boot 4.1.1, Java 17, Spring Data JPA, Lombok, banco **`restaurante`** (`root`, sem senha). Rodar: `mvn spring-boot:run` |

### Aulas 03–04 (raiz) — tudo implementado

- `SaudacaoServlet` (`/saudacao`) + `index.jsp`/`saudacao.jsp`.
- `ProdutoServlet` (`/produtos`): `doGet` lista (público); `doPost` com `acao=inserir|editar|excluir`, exige sessão, POST-redirect-GET.
- `AutenticacaoController` (`/login`, `/logout`), `UsuarioController` (`/registro`) com bcrypt (`SenhaUtil.hashSenha`/`checarSenha`).
- `AuthFilter` em `/admin/*` com `jakarta.servlet.*` — ou chama `chain.doFilter` ou redireciona, nunca os dois (o exemplo da aula faz os dois).
- `ProdutoDAO.editar`/`excluir` usam `nome` como chave, não `id`.
- Script: `sql/create_database.sql` (cria `produto` e `usuarios`; rodar 2x duplica os 3 produtos de exemplo).

### Aulas 05–08 (Spring) — diferenças em relação ao material

| Item | Material da aula | Repo |
|---|---|---|
| Banco | `projetoimobiliaria` (Aula 05) → `restaurante` (Aula 09) | `restaurante` |
| Spring Boot | 3.5.3 (deps da Aula 05) | 4.1.1 (Jackson 3) |
| `ImovelModel` precisão | `precision = 15` + `name` explícito | `precision = 10`, sem `name` (nomes de coluna saem iguais pela naming strategy) |
| `ImovelModel` extras | — | `usuario` (`@ManyToOne` → `UserModel`, ignora `senha` no JSON), `createdAt`/`updatedAt` |
| `BairroModel` | `nome`, `cidade`, `estado`, `cepInicial` | + `cepFinal`, timestamps, `@OneToMany(mappedBy = "bairro") List<ImovelModel> imoveis` |
| `TipoImovelModel` | `nome`, `descricao` | + timestamps |
| `UserModel` | `Integer id`, `tipo` String, getters manuais | `Long id`, enum `TipoUsuario` (`COMPRADOR`/`VENDEDOR`/`ADMIN`), Lombok `@Data` |
| DTO | `UserDTO` sem senha; alternativa `@JsonProperty(WRITE_ONLY)` | `dtos/UserDTO` (senha `WRITE_ONLY`, construtor a partir do model não copia senha) |
| `ImovelController` | `@Autowired` no campo, PUT 204 pra id inexistente | injeção por construtor, PUT devolve 404 corretamente |
| `ImovelService.update` | try/catch | sem try/catch |
| Upload de fotos (Aula 09) | `FotoImovel*` + `app.upload-dir` | implementado |
| Email (Aula 10) | `spring-boot-starter-mail` + Thymeleaf + Mailgun (extra: Gemini) | implementado |
| JWT (Aula 11) | Spring Security + `java-jwt` 4.4.0 | implementado (ver Aula 11); `usuarios.senha` agora com bcrypt |

**Referência cíclica (proposital):** `BairroModel.imoveis` ↔ `ImovelModel.bairro` faz `GET /bairros` (e `GET /imoveis/{id}`) entrar em loop na serialização. No Jackson 3 sai `HttpMessageNotWritableException: Document nesting depth (501) exceeds the maximum allowed (500)` e JSON truncado. **Continua ativa e quebra também `GET /imoveis` (lista).** Correções documentadas (não aplicadas) em `docs/referencia-ciclica.md`: `@JsonIgnore` em `imoveis`, `@JsonManagedReference`/`@JsonBackReference`, ou DTO.

Scripts: `migration_jwt.sql`, `testar-jwt.sh`, `jwt.insomnia.json`, `RESPOSTAS.md`, `dump.sql` (recria tabelas + dados de teste), `database.sql`, `migration_usuarios.sql`.

---

## Pendências / próximos passos

### Aulas 3–11
- ✅ Aulas 3/4 (Servlet/JSP), 5–8 (Spring), 9 (fotos), 10 (email) e 11 (JWT) implementadas e no GitHub.
- Resolver a referência cíclica Bairro ↔ Imóvel (bloqueia o front).
- Exercício da Aula 9 (excluir, editar, capa de foto): conferir se foi feito.
- Alinhar `ImovelModel` `precision = 10` → `15` só se quiser bater com o material (precisa `ALTER TABLE`).
- `dump.sql` tem a tabela sobra `imovel`; dá pra dropar.
- Corrigir o bug do material no `UserService.update` (`setEmail(dto.getNome())`) se o repo copiou.
- Limpar dados de teste do banco antes de apresentar (imóvel "Casa de teste JWT", usuários `teste@teste.com`, `teste2@teste.com`).
- Segredos fora do repo: `${JWT_SECRET}`, `${MAIL_USERNAME}`, `${MAIL_PASSWORD}`, `${GEMINI_API_KEY}`.

### Trabalho Final (Angular)
- Decidir estrutura do repo (monorepo novo, dois repos ou pasta no JavaWeb) e o nome.
- Aula 1: backend no ar + teste JWT ✅ (script), falta: CORS, correção do ciclo, `ng new`, primeira chamada `GET /imoveis`, repo + primeiro commit.
- Backend: `Oferta`, `Contrato`, `Favorito`, regras de transição, filtros/ordenação/paginação, endpoints do painel, PDF de contrato, e-mail.
- Perguntar ao professor: o que acontece com as ofertas "em espera" quando o contrato é cancelado (voltam a pendente?); qual perfil é o "cliente" (`USER` ou `COMPRADOR`).
