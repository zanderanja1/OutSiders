package com.example;

import java.io.*;

public class CityLScanner {
    private BufferedReader reader;
    private int current;
    private int lineNo = 1;
    private int columnNo = 0;



    public CityLScanner(InputStream in) {
        reader = new BufferedReader(new InputStreamReader(in));
    }

    // Reads the next character from the input
    private int read() throws IOException {
        current = reader.read();
        if (current == '\n') {
            lineNo++;
            columnNo = 0;
        } else {
            columnNo++;
        }
        return current;
    }

    private boolean isDigit(int ch) {
        return '0' <= ch && ch <= '9';
    }

    private boolean isLetter(int ch) {
        return ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z');
    }

    private boolean isAlphanumeric(int ch) {
        return isLetter(ch) || isDigit(ch);
    }

    private Token scanString() throws IOException {
        StringBuilder lexeme = new StringBuilder();
        while ((current = read()) != '"') {
            lexeme.append((char) current);
        }
        return new Token(TokenType.STRING, lexeme.toString());
    }

    private Token scanNumber() throws IOException {
        StringBuilder lexeme = new StringBuilder();
        boolean isDecimal = false;
        if (current == '-') {
            lexeme.append((char) current);
            current = read();
        }
        while (isDigit(current) || current == '.') {
            if (current == '.') {
                if (isDecimal) {
                    throw new IOException("Invalid float number format at line " + lineNo + ", column " + columnNo);
                }
                isDecimal = true;
            }
            lexeme.append((char) current);
            current = read();
        }
        if (isDecimal) {
            return new Token(TokenType.FLOAT, lexeme.toString());
        } else {
            return new Token(TokenType.INTEGER, lexeme.toString());
        }
    }


    private Token scanKeywordOrIdentifier() throws IOException {
        StringBuilder lexeme = new StringBuilder();
        while (isAlphanumeric(current) || current == '_') {
            lexeme.append((char) current);
            current = read();
        }
        String s = lexeme.toString();
        TokenType type;
        // check if s is a keyword
        // otherwise it's an identifier
        try {
            type = TokenType.valueOf(s.toUpperCase());
        } catch (IllegalArgumentException e) {
            type = TokenType.IDENTIFIER;
        }
        return new Token(type, s);
    }

    public Token nextToken() throws IOException {
        while (true) {
            current = read();

            if (current == -1) {
                return new Token(TokenType.EOF, "");
            }

            if (Character.isWhitespace(current)) {
                continue;
            }

            if (isLetter(current) || current == '_') {
                return scanKeywordOrIdentifier();
            }

            if (isDigit(current) || current == '.' || current == '-') {
                return scanNumber();
            }

            if (current == '"') {
                return scanString();
            }


            switch (current) {
                case '(':
                    return new Token(TokenType.LPAREN, "(");
                case ')':
                    return new Token(TokenType.RPAREN, ")");
                case '[':
                    return new Token(TokenType.LBRACKET, "[");
                case ',':
                    return new Token(TokenType.COMMA, ",");
                case ']':
                    return new Token(TokenType.RBRACKET, "]");
                case '{':
                    return new Token(TokenType.LBRACE, "{");
                case '}':
                    return new Token(TokenType.RBRACE, "}");
                case ';':
                    return new Token(TokenType.SEMICOLON, ";");
                default:
                    throw new IOException("Unexpected character: " + (char) current);
            }
        }
    }

    public static void main(String[] args) {
        File file = new File("C:\\Users\\Gjoke Tashev\\IdeaProjects\\PrevProject\\src\\main\\java\\com\\example\\input.txt");
        try {
            CityLScanner scanner = new CityLScanner(new FileInputStream(file));
            Token token;
            do {
                token = scanner.nextToken();
                System.out.println(token);
            } while (token.getType() != TokenType.EOF);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


}
