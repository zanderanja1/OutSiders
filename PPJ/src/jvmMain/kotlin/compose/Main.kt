package compose

import androidx.compose.desktop.ui.tooling.preview.Preview
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.runtime.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import java.io.File
import androidx.compose.runtime.Composable
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.foundation.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.text.input.TextFieldValue
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import okhttp3.OkHttpClient
import okhttp3.Request


import Region
import Attraction
import City
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody


enum class State {
    Parser,
    Generator;
}

sealed class FunctionType {
    object Attractions : FunctionType()
    object Text : FunctionType()
    object Send : FunctionType()
}

val NAV_BAR_HEIGHT = 30.dp
@Composable
fun AddLocationToList(
    updatedRegions: MutableState<Map<String, Region>>,
) {
    val json = Json { ignoreUnknownKeys = true }
    //val updatedRegions = remember { mutableStateOf(regions.toMutableMap()) }
    val regionInput = remember { mutableStateOf(TextFieldValue()) }
    val cityInput = remember { mutableStateOf(TextFieldValue()) }
    val nearbyInput = remember { mutableStateOf(TextFieldValue()) }
    val nameInput = remember { mutableStateOf(TextFieldValue()) }
    val latInput = remember { mutableStateOf(TextFieldValue()) }
    val lngInput = remember { mutableStateOf(TextFieldValue()) }
    Column {
        Row(modifier = Modifier.padding(10.dp)) {
            TextField(
                value = regionInput.value,
                onValueChange = { regionInput.value = it },
                label = { Text("Region") }

            )
            Spacer(modifier = Modifier.padding(10.dp))
            TextField(
                value = cityInput.value,
                onValueChange = { cityInput.value = it },
                label = { Text("City") }
            )
            Spacer(modifier = Modifier.padding(10.dp))
            TextField(
                value = latInput.value,
                onValueChange = { latInput.value = it },
                label = { Text("Latitude") }
            )

        }
        Row(modifier = Modifier.padding(10.dp)) {
            TextField(
                value = nameInput.value,
                onValueChange = { nameInput.value = it },
                label = { Text("Name") }
            )
            Spacer(modifier = Modifier.padding(10.dp))
            TextField(
                value = nearbyInput.value,
                onValueChange = { nearbyInput.value = it },
                label = { Text("Nearby") }
            )
            Spacer(modifier = Modifier.padding(10.dp))
            TextField(
                value = lngInput.value,
                onValueChange = { lngInput.value = it },
                label = { Text("Longitude") }
            )
        }

        Button(
            onClick = {
                val region = regionInput.value.text
                val city = cityInput.value.text
                val nearby = nearbyInput.value.text
                val name = nameInput.value.text
                val lat = latInput.value.text.toDoubleOrNull() ?: 0.0
                val lng = lngInput.value.text.toDoubleOrNull() ?: 0.0
                SaveAttractionToJSON(updatedRegions, region, name, nearby, listOf(lat, lng))

                // Clear the input values
                regionInput.value = TextFieldValue()
                cityInput.value = TextFieldValue()
                nearbyInput.value = TextFieldValue()
                nameInput.value = TextFieldValue()
                latInput.value = TextFieldValue()
                lngInput.value = TextFieldValue()
            }
        ) {
            Text("Save")
        }
    }

}

fun SaveAttractionToJSON(
    regions: MutableState<Map<String, Region>>,
    regionName: String,
    attractionName: String,
    nearbyName: String,
    coordinates: List<Double>,
) {
    val region = regions.value[regionName]
    if (region != null) {
        val city = region.cities.values.firstOrNull()
        if (city != null) {
            val nearby = city.nearby[nearbyName]
            if (nearby != null) {
                if (attractionName.isNotEmpty()) {
                    // Update existing attraction
                    val attraction = nearby.find { it.name == attractionName }
                    if (attraction != null) {
                        attraction.coordinates = coordinates
                    } else {
                        val newAttraction = Attraction(attractionName, coordinates)
                        nearby.add(newAttraction)
                    }
                } else {
                    // Add new attraction
                    val newAttraction = Attraction("coordinates", coordinates)
                    nearby.add(newAttraction)
                }
            } else {
                // Create new nearby list with the attraction
                val newNearby = mutableListOf(Attraction("coordinates", coordinates))
                city.nearby[nearbyName] = newNearby

            }
        } else {
            // Create new city and nearby list with the attraction
            val newNearby = mutableMapOf(nearbyName to mutableListOf(Attraction(attractionName, coordinates)))
            region.cities[regionName] = City(newNearby)
        }
    } else {
        // Create new region, city, and nearby list with the attraction
        val newNearby = mutableMapOf(nearbyName to mutableListOf(Attraction(attractionName, coordinates)))
        val newCity = mutableMapOf(regionName to City(newNearby))
        regions.value = regions.value.toMutableMap() + Pair(regionName, Region(newCity))
    }

    // Save the updated regions to the JSON file
    val json = Json { ignoreUnknownKeys = true }
    val updatedJsonContent = json.encodeToString(regions.value)
    File("PPJ/src/jvmMain/resources/output_sample2.json").writeText(updatedJsonContent)
}
fun saveUpdatedAttraction(regions: Map<String, Region>, jsonFilePath: String) {
    val json = Json { ignoreUnknownKeys = true }
    val updatedJsonContent = json.encodeToString(regions)
    File(jsonFilePath).writeText(updatedJsonContent)
}
fun storeListToFile(data: List<String>) {
    val fileName = "SampleHotelCoordinates.txt"
    val file = File("PPJ/src/jvmMain/resources/$fileName")
    file.bufferedWriter().use { writer ->
        for (item in data) {
           writer.write(item)
            writer.newLine()
        }
    }
}

@Composable
fun ShowHotels(list: SnapshotStateList<String>) {
    Box {
        val state = rememberLazyListState()
        LazyColumn(Modifier.fillMaxSize().padding(end = 12.dp), state) {
            itemsIndexed(list) { index, item ->
                val hotelAttributes = item.split('|')
                val name = hotelAttributes[0].replace("\\[.*?]".toRegex(), "")
                val address = hotelAttributes[1].replace("\\[.*?]".toRegex(), "")
                val city = hotelAttributes[2].replace("\\[.*?]".toRegex(), "")
                val zipcode = hotelAttributes[3].replace("\\[.*?]".toRegex(), "")
                val coordinates = hotelAttributes[4].replace("\\[.*?]".toRegex(), "")
                val contactInfo = hotelAttributes[5]
                    .replace("\\[pref contact]".toRegex(), "")
                    .replace("[", "")
                    .replace("]", "")

                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                    var isEditing by remember { mutableStateOf(false) }
                    var editedText by remember { mutableStateOf(TextFieldValue("[name]"+ name + " |[address]" + address + " |[city]" + city + " |[zipcode] " +zipcode +" |[coordinates]"+ coordinates + " |[pref contact] " + contactInfo)) }

                    if (isEditing) {
                        TextField(
                            value = editedText,
                            onValueChange = { editedText = it },
                            modifier = Modifier.weight(1f)
                        )
                    } else {
                        Text(
                            text = "$address $city $zipcode $coordinates $contactInfo",
                            modifier = Modifier.weight(1f)
                        )
                    }

                    IconButton(
                        onClick = {
                            if (isEditing) {
                                list[index] = editedText.text
                                storeListToFile(list)
                            }
                            isEditing = !isEditing
                        },
                        modifier = Modifier.align(Alignment.CenterVertically)
                    ) {
                        Icon(
                            imageVector = if (isEditing) Icons.Default.Done else Icons.Default.Edit,
                            contentDescription = if (isEditing) "Save" else "Edit"
                        )
                    }

                    IconButton(
                        onClick = {
                            list.remove(item)
                            storeListToFile(list)
                        },
                        modifier = Modifier.align(Alignment.CenterVertically)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Remove"
                        )
                    }
                }
            }
        }
        VerticalScrollbar(
            modifier = Modifier.align(Alignment.CenterEnd).fillMaxHeight(),
            adapter = rememberScrollbarAdapter(
                scrollState = state
            )
        )
    }
}


@Composable
fun MainPage(state: State, list: SnapshotStateList<String>) {
    val stateVertical = rememberScrollState(0)

    Box(
        Modifier.fillMaxSize().padding(top = NAV_BAR_HEIGHT).padding(bottom = NAV_BAR_HEIGHT),
        contentAlignment = Alignment.Center
    ) {

        when (state) {
            State.Parser -> {
                ToggleButton(list)
            }


            State.Generator -> {

                val regions = getRegionsFromJson("PPJ/src/jvmMain/resources/output_sample2.json")
                val updatedRegionsState = remember { mutableStateOf(regions) }
                AddLocationToList(updatedRegionsState)
            }

            else -> {
                Text(
                    fontSize = 20.sp,
                    textAlign = TextAlign.Center,
                    text = "Napaka"
                )
            }
        }
    }
}

@Composable
fun ButtonComponent(onClick: () -> Unit) {
    Row {
        Box(
            modifier =
            Modifier
                .fillMaxWidth().weight(1f)
                .height(NAV_BAR_HEIGHT)
                .clickable { onClick() }
                .background(Color.Cyan)

        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.align(Alignment.Center),
            ) {
                Icon(
                    imageVector = Icons.Default.Menu,
                    contentDescription = "Menu",
                    modifier = Modifier.size(18.dp),

                    tint = Color.Black

                )
                Text(
                    text = " Parser"
                )
            }

        }
        Box(
            modifier =
            Modifier
                .fillMaxWidth().weight(1f)
                .height(NAV_BAR_HEIGHT)
                .clickable { onClick() }
                .background(Color.Cyan)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.align(Alignment.Center),
            ) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = "Info",
                    modifier = Modifier.size(18.dp),
                    tint = Color.Black

                )
                Text(
                    text = " Generator"
                )
            }
        }
    }
}
@Composable
fun ShowAttractions(
    regions: Map<String, Region>,
    jsonFilePath: String,
    onSave: (Map<String, Region>) -> Unit,
) {
    Json { ignoreUnknownKeys = true }
    val updatedRegions = remember { mutableStateOf(regions.toMutableMap()) }
    val entries = remember(updatedRegions) { updatedRegions.value.entries.toList() }
    Box(modifier = Modifier.fillMaxSize()) {
        val state = rememberLazyListState()
        LazyColumn(
            Modifier.fillMaxSize().padding(end = 12.dp), state
        ) {

            item {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 85.dp)
                ) {
                    Text(
                        text = "Attraction name",
                        modifier = Modifier.weight(1f),
                        textAlign = TextAlign.Center
                    )
                    Text(
                        text = "City",
                        modifier = Modifier.weight(1f),
                        textAlign = TextAlign.Center
                    )
                    Text(
                        text = "Region",
                        modifier = Modifier.weight(1f),
                        textAlign = TextAlign.Center
                    )
                    Text(
                        text = "Coordinates",
                        modifier = Modifier.weight(1f),
                        textAlign = TextAlign.Center
                    )

                }
            }
            regions.forEach { (regionName, region) ->
                region.cities.forEach { (cityName, city) ->
                    city.nearby.forEach { (nearbyName, attractions) ->

                        itemsIndexed(attractions) { index, attraction ->
                            val attractionIndex = index;
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .padding(all = 10.dp)
                                    .border(
                                        width = 1.dp,
                                        color = Color.Black,
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .padding(30.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = "Item",
                                    modifier = Modifier.size(40.dp),
                                    tint = Color.Black
                                )
                                Spacer(modifier = Modifier.width(20.dp))
                                var isEditing by remember { mutableStateOf(false) }
                                var editedAttractionName by remember { mutableStateOf(attraction.name) }
                                var editedCityName by remember { mutableStateOf(cityName) }
                                var editedRegionName by remember { mutableStateOf(regionName) }
                                var editedCoordinates by remember {
                                    mutableStateOf(attraction.coordinates.joinToString(", "))
                                }

                                if (isEditing) {
                                    TextField(
                                        value = editedAttractionName,
                                        onValueChange = { editedAttractionName = it },
                                        modifier = Modifier.weight(1f)
                                    )
                                    TextField(
                                        value = editedCityName,
                                        onValueChange = { editedCityName = it },
                                        modifier = Modifier.weight(1f)
                                    )
                                    TextField(
                                        value = editedRegionName,
                                        onValueChange = { editedRegionName = it },
                                        modifier = Modifier.weight(1f)
                                    )
                                    TextField(
                                        value = editedCoordinates,
                                        onValueChange = { editedCoordinates = it },
                                        modifier = Modifier.weight(1f)
                                    )
                                } else {
                                    Text(
                                        text = if (attraction.name == "coordinates" || attraction.name.isEmpty()) {
                                            nearbyName
                                        } else {
                                            attraction.name
                                        },
                                        modifier = Modifier.weight(1f),
                                        textAlign = TextAlign.Center
                                    )
                                    Text(
                                        cityName,
                                        modifier = Modifier.weight(1f),
                                        textAlign = TextAlign.Center
                                    )
                                    Text(
                                        regionName,
                                        modifier = Modifier.weight(1f),
                                        textAlign = TextAlign.Center
                                    )
                                    Text(
                                        attraction.coordinates.joinToString(", "),
                                        modifier = Modifier.weight(1f),
                                        textAlign = TextAlign.Center
                                    )
                                }

                                Spacer(modifier = Modifier.width(50.dp))

                                IconButton(
                                    onClick = {
                                        if (isEditing) {
                                            // Update the edited values
                                            val updatedAttractions =
                                                updatedRegions.value[regionName]?.cities?.get(cityName)?.nearby?.get(
                                                    nearbyName
                                                )
                                            updatedAttractions?.get(attractionIndex)?.name = editedAttractionName
                                            updatedAttractions?.get(attractionIndex)?.coordinates =
                                                editedCoordinates.split(",").map {
                                                    it.trim().toDoubleOrNull() ?: 0.0
                                                }
                                            updatedRegions.value[regionName]?.cities?.get(cityName)?.nearby?.set(
                                                nearbyName,
                                                updatedAttractions ?: mutableListOf()
                                            )
                                            onSave(updatedRegions.value) // Invoke the onSave callback with updatedRegions.value
                                        }
                                        isEditing = !isEditing
                                    },
                                    modifier = Modifier.align(Alignment.CenterVertically)
                                ) {
                                    Icon(
                                        imageVector = if (isEditing) Icons.Default.Done else Icons.Default.Edit,
                                        contentDescription = if (isEditing) "Save" else "Edit"
                                    )
                                }

                                IconButton(
                                    onClick = {
                                        val updatedAttractions =
                                            updatedRegions.value[regionName]?.cities?.get(cityName)?.nearby?.get(
                                                nearbyName
                                            )
                                        updatedAttractions?.removeAt(attractionIndex)
                                        updatedRegions.value[regionName]?.cities?.get(cityName)?.nearby?.set(
                                            nearbyName,
                                            updatedAttractions ?: mutableListOf()
                                        )
                                        updatedRegions.value =
                                            updatedRegions.value // Update the state to trigger recomposition
                                        onSave(updatedRegions.value)
                                    },
                                    modifier = Modifier.align(Alignment.CenterVertically)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Delete,
                                        contentDescription = "Remove"
                                    )
                                }
                            }
                        }
                    }

                }
            }
        }
        VerticalScrollbar(
            modifier = Modifier.align(Alignment.CenterEnd).fillMaxHeight(),
            adapter = rememberScrollbarAdapter(
                scrollState = state
            )
        )

    }


}


@Composable
@Preview
fun App(list: SnapshotStateList<String>) {
    var buttonState by remember { mutableStateOf(State.Parser) }
    MaterialTheme {

        ButtonComponent {
            buttonState = when (buttonState) {
                State.Parser -> State.Generator
                State.Generator -> State.Parser
            }
        }
        MainPage(buttonState, list)
        Footer(buttonState)


    }
}
@Composable
fun Footer(state: State) {
    Column(
        Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Bottom,
        horizontalAlignment = Alignment.CenterHorizontally

    ) {
        Text(
            modifier = Modifier.background(Color.Cyan).fillMaxWidth().padding(10.dp),
            fontSize = 15.sp,
            textAlign = TextAlign.Center,
            text = "You're viewing the \"$state\" page"
        )

    }
}
fun fileToList(inputfile: File): MutableList<String> {
    val list = mutableListOf<String>()
    inputfile.forEachLine { line ->
        list.add(line)
    }
    return list
}
fun getRegionsFromJson(jsonFilePath: String): Map<String, Region> {
    val json = Json { ignoreUnknownKeys = true }
    val jsonContent = File(jsonFilePath).readText()
    return json.decodeFromString(jsonContent)
}

@Composable
fun ToggleButton(list: SnapshotStateList<String>) {
    val context = LocalContextMenuRepresentation.current
    val currentFunction = remember { mutableStateOf<FunctionType>(FunctionType.Attractions) }
    Column(

    ) {
        Row() {
            Button(
                onClick = {
                    currentFunction.value = FunctionType.Send
                },
                modifier =
                Modifier
                    .fillMaxWidth().weight(1f)
                    .height(NAV_BAR_HEIGHT),

                colors = ButtonDefaults.buttonColors(backgroundColor = Color.Cyan)

            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "Menu",
                    modifier = Modifier.size(18.dp),

                    tint = Color.Black

                )
                Text(text = "Send")
            }
            Button(
                onClick = {
                    currentFunction.value = FunctionType.Attractions
                },
                modifier =
                Modifier
                    .fillMaxWidth().weight(1f)
                    .height(NAV_BAR_HEIGHT),

                colors = ButtonDefaults.buttonColors(backgroundColor = Color.Cyan)

            ) {
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = "Menu",
                    modifier = Modifier.size(18.dp),

                    tint = Color.Black

                )
                Text(text = "Show Attractions")
            }

            Button(
                onClick = {
                    currentFunction.value = FunctionType.Text
                },
                modifier =
                Modifier
                    .fillMaxWidth().weight(1f)
                    .height(NAV_BAR_HEIGHT),
                colors = ButtonDefaults.buttonColors(backgroundColor = Color.Cyan)


            ) {
                Icon(
                    imageVector = Icons.Default.Home,
                    contentDescription = "Menu",
                    modifier = Modifier.size(18.dp),

                    tint = Color.Black

                )
                Text(text = "Show Hotels")
            }

        }
        Spacer(Modifier.padding(bottom = 10.dp))
        when (currentFunction.value) {
            is FunctionType.Attractions -> {
                val regions = getRegionsFromJson("PPJ/src/jvmMain/resources/output_sample2.json")
                val updatedRegionsState = remember { mutableStateOf(regions) }
                //val regions = updatedRegionsState.value
                val jsonFilePath = "PPJ/src/jvmMain/resources/output_sample2.json"
                ShowAttractions(
                    regions = regions,
                    jsonFilePath = jsonFilePath
                ) { updatedRegions ->
                    // Update the mutable state with the new regions
                    updatedRegionsState.value = updatedRegions
                    saveUpdatedAttraction(updatedRegions, jsonFilePath)
                }
            }

            is FunctionType.Text -> {
                val list2 = remember { list }
                ShowHotels(list2)
            }
            is FunctionType.Send -> {
                parseAttractionsJson("PPJ/src/jvmMain/resources/output_sample2.json")
            }

        }
    }

}
@Serializable
data class RegionResponse(val name: String, val _id: String)
@Serializable
data class CityResponse(val name: String, val _id: String, val regionId: String)
@Serializable
data class DistrictResponse(val name: String, val _id: String, val cityId: String)

fun sendRegionRequest(regionName: String):String? {
    val client = OkHttpClient()
    val url = "http://localhost:3001/region/"
    val requestBody = "name=$regionName"

    val request = Request.Builder()
        .url(url)
        .post(requestBody.toRequestBody("application/x-www-form-urlencoded".toMediaTypeOrNull()))
        .build()

    try {
        val response = client.newCall(request).execute()
        val responseBody = response.body?.string()

        // Handle the response if needed
        println("Response: $responseBody")
        val regionResponse = responseBody?.let { Json.decodeFromString<RegionResponse>(it) }

        // Extract the _id value
        val id = regionResponse?._id
        return id
    } catch (e: Exception) {
        // Handle any exceptions
        e.printStackTrace()
    }
    return null
}
fun sendCityRequest(cityName: String, regionId:String):String? {
    val client = OkHttpClient()
    val url = "http://localhost:3001/city/"
    if(cityName!="Maribor")
        return null;
    val requestBody = "name=$cityName&regionId=$regionId"

    val request = Request.Builder()
        .url(url)
        .post(requestBody.toRequestBody("application/x-www-form-urlencoded".toMediaTypeOrNull()))
        .build()

    try {
        val response = client.newCall(request).execute()
        val responseBody = response.body?.string()

        // Handle the response if needed
        println("Response: $responseBody")
        val cityResponse = responseBody?.let { Json.decodeFromString<CityResponse>(it) }

        // Extract the _id value
        val id = cityResponse?._id
        return id
    } catch (e: Exception) {
        // Handle any exceptions
        e.printStackTrace()
    }
    return null
}
fun sendDistrictRequest(nearbyName: String, cityId:String):String? {
    val client = OkHttpClient()
    val url = "http://localhost:3001/district/"

    val requestBody = "name=$nearbyName&cityId=$cityId"

    val request = Request.Builder()
        .url(url)
        .post(requestBody.toRequestBody("application/x-www-form-urlencoded".toMediaTypeOrNull()))
        .build()

    try {
        val response = client.newCall(request).execute()
        val responseBody = response.body?.string()

        // Handle the response if needed
        println("Response: $responseBody")
        val cityResponse = responseBody?.let { Json.decodeFromString<DistrictResponse>(it) }

        // Extract the _id value
        val id = cityResponse?._id
        println("district id: " + id)
        return id
    } catch (e: Exception) {
        // Handle any exceptions
        e.printStackTrace()
    }
    return null
}
fun sendAttractionRequest(attractionName: String, districtId:String, coordinates: List<Double>):Boolean {
    val client = OkHttpClient()
    val url = "http://localhost:3001/attraction/"
    val coordinatesJson = Json.encodeToString(coordinates)
    val requestBody = "name=$attractionName&districtId=$districtId&coordinates=$coordinatesJson"

    val request = Request.Builder()
        .url(url)
        .post(requestBody.toRequestBody("application/x-www-form-urlencoded".toMediaTypeOrNull()))
        .build()

    try {
        val response = client.newCall(request).execute()
        val responseBody = response.body?.string()
        println(responseBody)

        return response.code == 200


        // Handle the response if needed
    } catch (e: Exception) {
        // Handle any exceptions
        e.printStackTrace()
    }
    return false
}
fun parseAttractionsJson(jsonFilePath: String) {
    val regions = getRegionsFromJson(jsonFilePath)
    regions.forEach { (regionName, region) ->
        region.cities.forEach { (cityName, city) ->
            city.nearby.forEach { (nearbyName, attractions) ->
                attractions.forEach { (attractionName, coordinates) ->
                    if (attractionName == "coordinates") {
                        println(attractions + ": " + coordinates.toString() + " district" + nearbyName + " city: " + cityName + " " + "region " + regionName)
                    } else {
                        println(nearbyName + ": " + coordinates.toString() + " district" + nearbyName + " city: " + cityName + " " + "region " + regionName)
                    }

                    // Send the POST request
                    val regionId=sendRegionRequest(regionName)
                    var cityId:String?;
                    if (regionId != null) {
                       cityId = sendCityRequest(cityName,regionId)
                        println("cityId:" + cityId)
                        if(cityId != null){
                            val districtId= sendDistrictRequest(nearbyName,cityId)
                            if(districtId != null){
                                if(sendAttractionRequest(attractionName,districtId,coordinates)){
                                    println(attractionName + " usepsno dodan")
                                }
                                else
                                    println(attractionName + " neuspesno dodan")
                            }
                        }
                    }

                }
            }
        }
    }
}


fun main() = application {
    Window(onCloseRequest = ::exitApplication, title = "") {
        val inputfile = File("PPJ/src/jvmMain/resources/SampleHotelCoordinates.txt")
        val editedList = remember { mutableStateListOf<String>().apply { addAll(fileToList(inputfile)) } }
        App(editedList)
    }
}