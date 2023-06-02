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
import androidx.compose.material.*
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.text.input.TextFieldValue
import java.awt.TextField


enum class State {
    Parser,
    Generator;
}

val NAV_BAR_HEIGHT = 30.dp

@Composable
fun ShowHotels(list: SnapshotStateList<String>) {
    Box {
        val state = rememberLazyListState()
        LazyColumn(Modifier.fillMaxSize().padding(end = 12.dp), state) {
            itemsIndexed(list) { index, item ->
                val cleanedItem = item
                val hotelAttributes = cleanedItem.split('|')
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
                    var editedText by remember { mutableStateOf(TextFieldValue(address + " " + city + " " + zipcode + " " + coordinates + " " + contactInfo)) }

                    if (isEditing) {
                        TextField(
                            value = editedText,
                            onValueChange = { editedText = it },
                            modifier = Modifier.weight(1f)
                        )
                    } else {
                        Text(
                            text = (address + " " + city + " " + zipcode + " " + coordinates + " " + contactInfo),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    IconButton(
                        onClick = {
                            if (isEditing) {
                                val updatedItem = "[${editedText.text}]"
                                list[list.indexOf(item)] = updatedItem
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
                ShowHotels(list)
            }


            State.Generator -> {
                Text("Generator")
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
        //Footer(buttonState)


    }
}
fun fileToList(inputfile: File): MutableList<String> {
    val list = mutableListOf<String>()
    inputfile.forEachLine { line ->
        list.add(line)
    }
    return list
}

fun main() = application {
    Window(onCloseRequest = ::exitApplication, title = "") {
        val inputfile = File("PPJ/src/jvmMain/resources/SampleHotelCoordinates.txt")
        val editedList = remember { mutableStateListOf<String>().apply { addAll(fileToList(inputfile)) } }
        App(editedList)
    }
}