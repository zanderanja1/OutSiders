module com.example.prevproject {
    requires javafx.controls;
    requires javafx.fxml;
    requires org.locationtech.jts;
    requires geojson.jackson;



    opens com.example.prevproject to javafx.fxml;
    exports com.example;
}