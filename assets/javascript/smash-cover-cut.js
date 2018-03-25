//firebase configuration
var config = {
	apiKey: "AIzaSyA7z1TRd0w3633MNlyQnHIQSytUAs2qWMY",
	authDomain: "oylo-firebase.firebaseapp.com",
	databaseURL: "https://oylo-firebase.firebaseio.com",
	projectId: "oylo-firebase",
	storageBucket: "",
	messagingSenderId: "667579647767"
};

//firebase initialization
firebase.initializeApp(config);

//firebase database reference
var database = firebase.database();
//array of chat messages
var list_of_messages = ["+ + + public chat + + +"];
//player round choices
var red_choice = "", blue_choice = "";
//booleans to determine if players have chosen
var red_chose = false, blue_chose = false;
//game stat variables
var red_wins = 0, blue_wins = 0, ties = 0;
//temporary variables to check game stats
var red_wins_temp = red_wins;
var blue_wins_temp = blue_wins;

//live data transmission from firebase
database.ref().on("value", function(snapshot) {
	//setting all the variables
	list_of_messages = snapshot.val().chat_messages;
	red_choice = snapshot.val().red_choice;
	blue_choice = snapshot.val().blue_choice;
	red_chose = snapshot.val().red_chose;
	blue_chose = snapshot.val().blue_chose;
	red_wins = snapshot.val().red_wins;
	blue_wins = snapshot.val().blue_wins;
	ties = snapshot.val().ties;

	//setting the number of wins for each player
	$(".red_wins").text("wins: " + red_wins);
	$(".blue_wins").text("wins: " + blue_wins);

	//determine user interface elements states based on player_chose data pulled from firebase
	if (red_chose) {
		$(".red_options").css('opacity', 0);
		$(".game_status").text("red has chosen");
	}

	if (blue_chose) {
		$(".blue_options").css('opacity', 0);
		$(".game_status").text("blue has chosen");
	}

	//check if both players have chosen
	if (red_chose && blue_chose)
		check_result();
	
	//generate chat messages
	generate_chat_messages(list_of_messages);
}, function(errorObject) {
	//error handling
	console.log("errors handled: " + errorObject.code);
});

//when the document is ready for manipulation
$(document).ready(function() {
	//if the send_message_button is clicked
	$(".send_message_button").on('click', function() {
		actually_send_message();
	});

	//if an option from the red_options panel is clicked
	$(".red_options").on("click", ".option_button", function() {
		//don't let the player choose twice!
		if (!red_chose) {
			//reference to clicked element's text value
			var choice = $(this).val();

			//setting player's choice to aformentioned reference
			red_choice = choice;
			//and confirming that they have made a selection
			red_chose = true;

			//interface state changes
			$(".red_options").css('opacity', 0);

			if (!blue_chose)
				$(".game_status").text("red has chosen");

			//update firebase data
			update_firebase();

			//check result of player's choice (waiting, won, lost, tied)
			check_result();
		}
	});

	//if an option from the blue_options panel is clicked
	$(".blue_options").on("click", ".option_button", function() {
		//don't let the player choose twice!
		if (!blue_chose) {
			//reference to clicked element's text value
			var choice = $(this).val();

			//setting player's choice to aformentioned reference
			blue_choice = choice;
			//and confirming that they have made a selection
			blue_chose = true;

			//interface state changes
			$(".blue_options").css('opacity', 0);

			if (!red_chose)
				$(".game_status").text("blue has chosen");

			//update firebase data
			update_firebase();

			//check result of player's choice (waiting, won, lost, tied)
			check_result();
		}
	});
});

//pick up 'enter' key presses for game chat
$(document).keypress(function(e) {
	var keycode = (e.keyCode ? e.keyCode : e.which);
	
	if (keycode == '13')
		actually_send_message();
});

//update firebase data
function update_firebase() {
	//set references
	database.ref().set({
		chat_messages: list_of_messages,
		red_choice: red_choice, 
		blue_choice: blue_choice,
		red_chose: red_chose,
		blue_chose: blue_chose,
		red_wins: red_wins,
		blue_wins: blue_wins,
		ties: ties
	});
}

//check result of player's choice
function check_result() {
	//temporary win variables to determine round winners
	red_wins_temp = red_wins;
	blue_wins_temp = blue_wins;

	//if both players have chosen
	if (red_chose && blue_chose) {
		//find out which player got a point or if they tied
		if (red_choice === "rock" && blue_choice === "scissors")
			red_wins++;
		else if (red_choice === "scissors" && blue_choice === "paper")
			red_wins++;
		else if (red_choice === "paper" && blue_choice === "rock")
			red_wins++;
		else if (red_choice === blue_choice)
			ties++;
		else
			blue_wins++;

		//reveal the winner based on a current vs temporary wins check
		if (red_wins_temp < red_wins)
			reveal("red");
		else if (blue_wins_temp < blue_wins)
			reveal("blue");
		else
			reveal("tie");

		//reset player choices and player chosen states
		red_choice = "", blue_choice = "";
		red_chose = false, blue_chose = false;

		//update firebase data
		update_firebase();
	}
}

//reveal game state
function reveal(winner) {
	var game_status = $(".game_status");
	
	//check to see if there was a winner
	if (winner === "tie")
		game_status.text("it was a tie!");
	else {
		game_status.text(winner + " won! --- get ready...");
		
		if (winner === "red") {
			game_status.css('color', '#884545');
		} else if (winner === "blue") {
			game_status.css('color', '#454588');
		}
	}
	
	//a e s t h e t i c
	shake_element(".game_status", "-default");
	shake_element(".game_window", "-default");

	//reset game options after two seconds
	setTimeout(function() {
		$(".game_status").text("waiting for both players to chose").css('color', 'black');
		$(".red_options").css('opacity', 1);
		$(".blue_options").css('opacity', 1);
	}, 2750);
}

//generate messages from firebase array and append them to the chat_messages_container
function generate_chat_messages(chat_messages_array) {
	//reference to the chat messages container
	var chat_messages_container = $(".chat_messages_container");

	//empty it out
	chat_messages_container.empty();
	
	//for each message in the chat messages array...
	for (var i = 0; i < (Object.keys(chat_messages_array).length); i++) {
		//create a paragraph element
		var new_message = $('<p>');

		//set its text to current index of array and give it the class 'chat_message'
		new_message.text(chat_messages_array[i]).addClass("chat_message");

		//append each messages to the container
		chat_messages_container.append(new_message);
	}
	
	//scroll to the bottom of the container (that's the direction chats usually flow in right?)
	$(".chat_messages_container").animate({ scrollTop: $('.chat_messages_container').prop("scrollHeight")}, 250);
}

//sends a new message to the chat
function actually_send_message() {
	//if the chat input is not empty
	if ($(".chat_input").val()) {
		//push the new message to the messages array
		list_of_messages.push($(".chat_input").val());

		//clear the chat input field
		$(".chat_input").val("");

		//update firebase data
		update_firebase();

		//regenerate messages
		generate_chat_messages(list_of_messages);
	}
}

/* add specified shaking classes to element matching id passed to element_id parameter */
function shake_element(element_id, type_of_shake) {
	$(`${element_id}`).addClass("shake").addClass("shake-constant");

	/* and then remove them after specified amount of time */
	setTimeout(function() { stop_shaking_element(`${element_id}`, type_of_shake); }, 2750);
}

/* remove specified shaking classes from element matching id passed to element_id parameter */
function stop_shaking_element(element_id, type_of_shake) {
	$(`${element_id}`).removeClass("shake").removeClass("shake-constant");
}