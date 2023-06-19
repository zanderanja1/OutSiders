package com.example;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

class CityLParser {
    private CityLScanner scanner;
    private Token currentToken;

    public CityLParser(CityLScanner scanner) {
        this.scanner = scanner;
        try {
            this.currentToken = scanner.nextToken();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void match(TokenType type) throws IOException {
        if (currentToken.getType() != type) {
            throw new Error("Unexpected token: " + currentToken.getLexeme());
        }
        currentToken = scanner.nextToken();
    }

    public Coordinates parseCoordinates() throws IOException {
        double x = Double.parseDouble(currentToken.getLexeme());
        match(TokenType.FLOAT);
        match(TokenType.COMMA);
        double y = Double.parseDouble(currentToken.getLexeme());
        match(TokenType.FLOAT);
        double z = 0.0;
        if (currentToken.getType() == TokenType.COMMA) {
            match(TokenType.COMMA);
            if (currentToken.getType() == TokenType.FLOAT) {
                z = Double.parseDouble(currentToken.getLexeme());
                match(TokenType.FLOAT);
            }
        }
        Coordinates cd = new Coordinates(x,y,z);
        //System.out.println(cd.toString());
        return cd;
    }

    public List<Coordinates> parsePolygonCoordinates() throws IOException {
        List<Coordinates> coordinatesList = new ArrayList<>();
        match(TokenType.LPAREN);  // match the opening parenthesis of the coordinates list
        while (currentToken.getType() != TokenType.RPAREN) {  // continue until the closing parenthesis
            match(TokenType.LBRACKET); // match the opening bracket of each coordinate pair
            double x = Double.parseDouble(currentToken.getLexeme());
            match(TokenType.FLOAT);
            match(TokenType.COMMA);
            double y = Double.parseDouble(currentToken.getLexeme());
            match(TokenType.FLOAT);
            match(TokenType.RBRACKET); // match the closing bracket of each coordinate pair
            Coordinates cd = new Coordinates(x, y);
            coordinatesList.add(cd);
            if (currentToken.getType() == TokenType.COMMA) {
                match(TokenType.COMMA);  // match the comma separating coordinate pairs
            }
        }
        match(TokenType.RPAREN);  // match the closing parenthesis of the coordinates list
        return coordinatesList;
    }


    public void parseCity() throws IOException {
        System.out.println(currentToken);
        match(TokenType.CITY);
        String cityName = parseCityName();

        List<Coordinates> coordinates = parsePolygonCoordinates();

        match(TokenType.LBRACE);
        City city = new City(cityName, coordinates);
        while (currentToken.getType() != TokenType.RBRACE) {
            parseCityElement();
        }
        match(TokenType.RBRACE);
        System.out.println(city.toGeoJSON());
    }
    public String parseCityName() throws IOException {
        String cityName = currentToken.getLexeme();
        match(TokenType.STRING); // assuming city name is a STRING token
        return cityName;
    }


    public void parseCityElement() throws IOException {
        switch (currentToken.getType()) {
            case DISTRICT:
                parseDistrict();
                break;
            case ZONE:
                parseZone();
                break;
            case STREET:
                parseStreet();
                break;
            case BUILDING:
                parseBuilding();
                break;
            case PARK:
                parsePark();
                break;
            case INFRASTRUCTURE:
                parseInfrastructure();
                break;
            case TRANSPORT:
                parseTransport();
                break;
            case TRAFFICLIGHT:
                parseTrafficLight();
                break;
            case RESTAURANT:
                parseRestaurant();
                break;
            case EVENT:
                parseEvent();
                break;
            case UTILITY:
                parseUtility();
                break;
            case MONUMENT:
                parseMonument();
                break;
            case ROUNDABOUT:
                parseRoundabout();
                break;
            case ATTRACTION:
                parseAttraction();
                break;
            default:
                throw new Error("Unexpected token in city element: " + currentToken.getLexeme());
        }

        // After parsing an element, check if there's a semicolon and if so, consume it
        if(currentToken.getType() == TokenType.SEMICOLON) {
            currentToken = scanner.nextToken();
        }
    }

    public void parseAttraction() throws IOException{
        match(TokenType.ATTRACTION);
        String attractionName = parseAttractionName(); //attraction name
        List<Coordinates> coordinates = parsePolygonCoordinates();

        Attraction at = new Attraction(attractionName, coordinates);

        System.out.println(at.toGeoJSON());
        currentToken=scanner.nextToken();
    }

    public String parseAttractionName() throws IOException {
        String attractionName = currentToken.getLexeme();
        match(TokenType.STRING); // assuming city name is a STRING token
        return attractionName;
    }

    public void parseRoundabout() throws IOException{
        match(TokenType.ROUNDABOUT);
        match(TokenType.STRING); //First street
        match(TokenType.COMMA);
        match(TokenType.STRING); //Second street
        match(TokenType.COMMA);
        match(TokenType.STRING); //Third street
        match(TokenType.LBRACKET);
        parseCoordinates();
        match(TokenType.RBRACKET);
        currentToken=scanner.nextToken();
    }



    public void parseDistrict() throws IOException {
        match(TokenType.DISTRICT);
        String districtName = parseDistrictName(); // District name
        List<Coordinates> coordinates = parsePolygonCoordinates();

        District ds = new District(districtName, coordinates);
        match(TokenType.LBRACE);
        while (currentToken.getType() != TokenType.RBRACE) {
            parseCityElement();
        }
        match(TokenType.RBRACE);
        System.out.println(ds.toGeoJSON());
    }

    public String parseDistrictName() throws IOException {
        String districtName = currentToken.getLexeme();
        match(TokenType.STRING); // assuming city name is a STRING token
        return districtName;
    }

    public void parseZone() throws IOException {
        match(TokenType.ZONE);
        match(TokenType.STRING); // Zone name
        match(TokenType.LBRACKET);
        parseCoordinates();
        match(TokenType.RBRACKET);
        match(TokenType.LBRACE);
        while (currentToken.getType() != TokenType.RBRACE) {
            parseZoneAttribute();
        }
        match(TokenType.RBRACE);
    }

    public void parseZoneAttribute() throws IOException {
        switch (currentToken.getType()) {
            case RESIDENTIAL:
            case COMMERCIAL:
            case INDUSTRIAL:
                currentToken = scanner.nextToken(); // consume the token
                break;
            default:
                throw new Error("Unexpected token in zone attribute: " + currentToken.getLexeme());
        }
    }


    public void parseStreet() throws IOException {
        match(TokenType.STREET);
        match(TokenType.STRING); // Street name
        match(TokenType.LBRACKET);
        parseCoordinates();
        match(TokenType.RBRACKET);
        if (currentToken.getType() != TokenType.LBRACE) {
            // Handle single attribute without braces
            parseStreetAttribute();
        } else {
            // Handle multiple attributes within braces
            match(TokenType.LBRACE);
            while (currentToken.getType() != TokenType.RBRACE) {
                parseStreetAttribute();
            }
            match(TokenType.RBRACE);
        }
    }



    public void parseStreetAttribute() throws IOException {
        switch (currentToken.getType()) {
            case STRING:
            case INTEGER:
                // Handle string attribute and integer attribute
                currentToken = scanner.nextToken();
                break;
            case CURVE:
                parseCurve();
                break;
            case NEWLYPAVED:
                currentToken = scanner.nextToken(); // consume the attribute and do nothing with it
                break;
            case OLD:
                currentToken = scanner.nextToken(); // consume the attribute and do nothing with it
                break;
            case UNDERCONSTRUCTION:
                currentToken = scanner.nextToken(); // consume the attribute and do nothing with it
                break;
            case DAMAGED:
                currentToken = scanner.nextToken(); // consume the attribute and do nothing with it
                break;
            default:
                throw new Error("Unexpected token in street attribute: " + currentToken.getLexeme());
        }
    }

    public void parseCurve() throws IOException {
        match(TokenType.CURVE);
        match(TokenType.STRING); // Street name
        match(TokenType.STRING); // Intersecting street name
    }

    public String parseBuildingName() throws IOException {
        String buildingName = currentToken.getLexeme();
        match(TokenType.STRING); // assuming city name is a STRING token
        return buildingName;
    }


    public void parseBuilding() throws IOException {
        match(TokenType.BUILDING);
        String buildingName = parseBuildingName(); // Building name
        List<Coordinates> coordinates = parsePolygonCoordinates();
        match(TokenType.LBRACE);
        Building building = new Building(buildingName, coordinates);
        while (currentToken.getType() != TokenType.RBRACE) {
            parseBuildingAttribute();
            // after parsing an attribute, consume a new token
            if (currentToken.getType() != TokenType.RBRACE) {
                currentToken = scanner.nextToken();
            }
        }
        match(TokenType.RBRACE);
        System.out.println(building.toGeoJSON());
    }

    public void parseBuildingAttribute() throws IOException {
        switch (currentToken.getType()) {
            case POOL:
            case GYM:
            case ROOFTOPACCESS:
            case RESIDENTIAL:
            case COMMERCIAL:
            case INDUSTRIAL:
            case INTEGER:  // Handle integer attributes
                break; // already consumed this token before entering the method
            case LBRACE:  // Handle list of features
                currentToken = scanner.nextToken();
                while (currentToken.getType() != TokenType.RBRACE) {
                    // Assumes that features inside the braces are also tokens
                    currentToken = scanner.nextToken();
                }
                break;
            default:
                throw new Error("Unexpected token in building attribute: " + currentToken.getLexeme());
        }
    }






    public void parsePark() throws IOException {
        match(TokenType.PARK);
        match(TokenType.STRING); // Park name
        match(TokenType.LBRACKET);
        parseCoordinates();
        match(TokenType.RBRACKET);
        match(TokenType.LBRACE);
        while (currentToken.getType() != TokenType.RBRACE) {
            parseParkAttribute();
            // after parsing an attribute, consume a new token
            if (currentToken.getType() != TokenType.RBRACE) {
                currentToken = scanner.nextToken();
            }
        }
        match(TokenType.RBRACE);
    }

    public void parseParkAttribute() throws IOException {
        switch (currentToken.getType()) {
            case INTEGER:  // Handle integer attributes
                break; // already consumed this token before entering the method
            case LBRACE:  // Handle list of features
                currentToken = scanner.nextToken();
                while (currentToken.getType() != TokenType.RBRACE) {
                    // Assumes that features inside the braces are also tokens
                    currentToken = scanner.nextToken();
                }
                break;
            default:
                throw new Error("Unexpected token in park attribute: " + currentToken.getLexeme());
        }
    }


    public void parseInfrastructure() throws IOException {
        match(TokenType.INFRASTRUCTURE);
        match(TokenType.STRING); // Infrastructure name
        if(currentToken.getType() == TokenType.BRIDGE || currentToken.getType() == TokenType.AIRPORT || currentToken.getType() == TokenType.TUNNEL) {
            currentToken = scanner.nextToken(); // Utility type
        } else {
            throw new Error("Unexpected token in utility type: " + currentToken.getLexeme());
        }
        match(TokenType.LBRACKET);
        parseCoordinates();
        match(TokenType.RBRACKET);
    }

    public void matchInfrastructureType() throws IOException {
        switch (currentToken.getType()) {
            case BRIDGE:
            case TUNNEL:
            case AIRPORT:
                scanner.nextToken();
                break;
            default:
                throw new Error("Unexpected token in infrastructure type: " + currentToken.getLexeme());
        }
        currentToken = scanner.nextToken();

    }

    public void parseWaterBody() throws IOException {
        match(TokenType.LPAREN);
        match(TokenType.STRING); // WaterBody name
        match(TokenType.COMMA);
        match(TokenType.INTEGER); // WaterBody length or area
        match(TokenType.RPAREN);
    }

    public void parseDistrictElement() throws IOException {
        switch (currentToken.getType()) {
            case STREET:
                parseStreet();
                break;
            case BUILDING:
                parseBuilding();
                break;
            case INFRASTRUCTURE:
                parseInfrastructure();
                break;
            case RIVER:
            case LAKE:
                parseWaterBody();
                break;
            case PARK:
                parsePark();
                break;
            default:
                throw new Error("Unexpected token in district element: " + currentToken.getLexeme());
        }
    }

    public void parseRestaurant() throws IOException {
        match(TokenType.RESTAURANT);
        match(TokenType.STRING); // Restaurant name
        match(TokenType.STRING); // Street name
        match(TokenType.LBRACKET);
        parseCoordinates();
        match(TokenType.RBRACKET);
        currentToken=scanner.nextToken();

    }

    public void parseEvent() throws IOException {
        match(TokenType.EVENT); // Match and consume the 'Event' keyword
        match(TokenType.STRING); // Event name
        match(TokenType.STRING); // Street name
        if(currentToken.getType() == TokenType.PARADE || currentToken.getType() == TokenType.FESTIVAL || currentToken.getType() == TokenType.FARMERS_MARKET) {
            currentToken = scanner.nextToken(); // Event type
        } else {
            throw new Error("Unexpected token in event type: " + currentToken.getLexeme());
        }
        match(TokenType.LBRACKET);
        parseCoordinates();
        match(TokenType.RBRACKET);
    }




    public void matchEventType() throws IOException {
        switch (currentToken.getType()) {
            case FESTIVAL:
            case PARADE:
            case FARMERS_MARKET:
                scanner.nextToken();
                break;
            default:
                throw new Error("Unexpected token in event type: " + currentToken.getLexeme());
        }
        //currentToken = scanner.nextToken();

    }

    public void parseUtility() throws IOException {
        match(TokenType.UTILITY); // Match and consume the 'Utility' keyword
        match(TokenType.STRING); // Utility name
        if(currentToken.getType() == TokenType.POWERPLANT || currentToken.getType() == TokenType.WATERTREATMENT) {
            currentToken = scanner.nextToken(); // Utility type
        } else {
            throw new Error("Unexpected token in utility type: " + currentToken.getLexeme());
        }
        match(TokenType.LBRACKET);
        parseCoordinates();
        match(TokenType.RBRACKET);
    }


    public void matchUtilityType() throws IOException {
        switch (currentToken.getType()) {
            case POWERPLANT:
            case WATERTREATMENT:
                scanner.nextToken();
                break;
            default:
                throw new Error("Unexpected token in utility type: " + currentToken.getLexeme());
        }
        currentToken = scanner.nextToken();
    }

    public void parseMonument() throws IOException {
        match(TokenType.MONUMENT);
        match(TokenType.STRING); // Monument name
        match(TokenType.STRING); // Street name
        match(TokenType.LBRACKET);
        parseCoordinates();
        match(TokenType.RBRACKET);
    }

    public void parseTransport() throws IOException {
        match(TokenType.TRANSPORT);
        match(TokenType.STRING); // Transport name
        match(TokenType.STRING);
        match(TokenType.LBRACKET);
        parseCoordinates();
        match(TokenType.RBRACKET);// Street name
    }

    public void parseTrafficLight() throws IOException {
        match(TokenType.TRAFFICLIGHT);
        match(TokenType.STRING); // Street name
        match(TokenType.STRING); // Intersection street name
        match(TokenType.LBRACKET);
        parseCoordinates();
        match(TokenType.RBRACKET);
    }

    public static void main(String[] args) {
        System.out.println("Program started");
        File file = new File("C:\\Users\\Gjoke Tashev\\IdeaProjects\\PrevProject\\src\\main\\java\\com\\example\\input.txt");
        try {
            // Read all lines of the file and print them
            List<String> lines = Files.readAllLines(file.toPath());
            for (String line : lines) {
                System.out.println(line);
            }

            // Proceed to the parsing
            CityLScanner scanner = new CityLScanner(new FileInputStream(file));
            CityLParser parser = new CityLParser(scanner);
            System.out.println("Parsing started"); // Added this line
            parser.parseCity();
            System.out.println("Parsing finished"); // Added this line

            // If the parsing succeeded without exceptions, print success message
            System.out.println("Successfully parsed input");
        } catch (IOException e) {
            // If an IOException occurred during parsing, print failure message
            System.out.println("Unsuccessfully parsed input");
            e.printStackTrace();
        } catch (Error e) {
            // If a parsing error occurred, print failure message
            System.out.println("Unsuccessfully parsed input");
            e.printStackTrace();
        } catch (Exception e) {
            // Catch all other exceptions
            System.out.println("Unsuccessfully parsed input due to an unexpected exception");
            e.printStackTrace();
        } catch (Throwable t) {
            System.out.println("Unsuccessfully parsed input due to an unexpected issue");
            t.printStackTrace();
        }
    }
}

