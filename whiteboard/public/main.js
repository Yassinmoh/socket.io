



document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const positionBtn = document.getElementById("position-btn");
  const ctx = canvas.getContext("2d");
  const socket = io();
  let isDragging = false;
  let offsetX, offsetY, currentDraggable;
  canvas.style.background = '#6ce76c'
  let activeTouches = [];
  let customFormations = {}


  // Function to find a player based on touch identifier
  function findPlayerByTouchId(touchId) {
    return activeTouches.find((touch) => touch.id === touchId)?.player;
  }

  // // Player positions data
  let players = [
    { x: 20, y: 31 },
    { x: 20, y: 97 },
    { x: 20, y: 166 },
    { x: 20, y: 232 },
    { x: 20, y: 299 },
    { x: 20, y: 373 },
    { x: 20, y: 446 },
    { x: 20, y: 518 },
    { x: 20, y: 597 },
    { x: 20, y: 669 },
    { x: 20, y: 741 },
  ];

  // Function to draw the players on the canvas
  function drawPlayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    players.forEach((player) => {
      ctx.beginPath();
      ctx.arc(parseInt(player.x), parseInt(player.y), 20, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.closePath();
    });
  }

  // Function to update player positions based on the selected formation

  // Handle formation change event
  let formationSelect = document.getElementById("formation");
  formationSelect.addEventListener("change", () => {
    const selectedFormation = formationSelect.value;
    if (selectedFormation in customFormations) {
      players = JSON.parse(localStorage.getItem(selectedFormation));
      drawPlayers();

      // Emit the selected custom formation to the server
      socket.emit("updateFormation", selectedFormation);
    } else {
      updateFormation(selectedFormation);
    }
  });
  let currentFormation = "default";
  function updateFormation(formation) {
    const positions = {
      default: [
        { x: 20, y: 31 },
        { x: 20, y: 97 },
        { x: 20, y: 166 },
        { x: 20, y: 232 },
        { x: 20, y: 299 },
        { x: 20, y: 373 },
        { x: 20, y: 446 },
        { x: 20, y: 518 },
        { x: 20, y: 597 },
        { x: 20, y: 669 },
        { x: 20, y: 741 },
      ],
      "4-3-3": [
        { x: 35, y: 360 },
        { x: 207, y: 82 },
        { x: 206, y: 238 },
        { x: 217, y: 500 },
        { x: 217, y: 670 },
        { x: 382, y: 132 },
        { x: 375, y: 352 },
        { x: 382, y: 615 },
        { x: 613, y: 155 },
        { x: 632, y: 571 },
        { x: 624, y: 363 },
      ],
      "4-2-3-1": [
        { x: 55, y: 400 },
        { x: 182, y: 105 },
        { x: 168, y: 262 },
        { x: 163, y: 555 },
        { x: 172, y: 721 },
        { x: 347, y: 310 },
        { x: 339, y: 513 },
        { x: 577, y: 193 },
        { x: 573, y: 438 },
        { x: 576, y: 665 },
        { x: 888, y: 437 },
      ],
    };

    const selectedFormation = positions[formation] || positions.default;

    // Apply the positions to each player element
    players.forEach((player, index) => {
      player.x = selectedFormation[index].x;
      player.y = selectedFormation[index].y;
    });

    // Emit the updated formation to the server
    drawPlayers()

    if (currentFormation !== formation) {
      socket.emit("updateFormation", formation);
      currentFormation = formation; // Update the currentFormation variable
    }
  }

  // // Handle formation change event
  // const formationSelect = document.getElementById("formation");
  // formationSelect.addEventListener("change", () => {
  //   const selectedFormation = formationSelect.value;
  //   updateFormation(selectedFormation);
  // });

  // Draw initial players
  drawPlayers();

  // Canvas mouse events
  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if the mouse is over a player
    currentDraggable = players.find((player) => {
      const dx = player.x - mouseX;
      const dy = player.y - mouseY;
      return dx * dx + dy * dy < 20 * 20; // Check if the distance is less than the player's radius (20)
    });

    if (currentDraggable) {
      offsetX = mouseX - currentDraggable.x;
      offsetY = mouseY - currentDraggable.y;
      isDragging = true;
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging && currentDraggable) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      currentDraggable.x = mouseX - offsetX;
      currentDraggable.y = mouseY - offsetY;

      drawPlayers();

      // Emit the updated position to the server
      socket.emit("updatePlayerPosition", { id: players.indexOf(currentDraggable), position: { x: currentDraggable.x, y: currentDraggable.y } });
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  positionBtn.addEventListener('click', () => {
    let jsonText = "[";
    players.forEach((player) => {
      jsonText += `{x:${player.x},y:${player.y}},`;
    });
    jsonText += "]";
    console.log(jsonText);
    alert(jsonText)
  })

  socket.on("updateFormation", (formation) => {
    const formationSelect = document.getElementById("formation");
    formationSelect.value = formation; // Update the select element's value
    updateFormation(formation); // Call the function to apply the new formation
  });
  // Handle incoming data from the server to update player positions
  socket.on("updatePlayerPosition", (data) => {
    const { id, position } = data;
    players[id].x = position.x;
    players[id].y = position.y;
    drawPlayers();
  });




  // Save custom formation
  function saveCustomFormation() {
    const name = prompt("Enter a name for the custom formation:");
    if (name) {
      customFormations[name] = [...players]; // Save the current player positions as the custom formation

      // Also save the player positions for the custom formation
      localStorage.setItem(name, JSON.stringify(players));
    }

  }


  // Update formation dropdown with custom formations
  function updateFormationDropdown() {
    const formationSelect = document.getElementById("formation");

    for (const name in customFormations) {
      // Check if the custom option already exists
      const existingOption = formationSelect.querySelector(`option[value="${name}"]`);

      if (!existingOption) {
        const customOption = document.createElement("option");
        customOption.value = name;
        customOption.textContent = name;


        formationSelect.appendChild(customOption);
      }
    }
  }

  // Add a delete button
  const deleteButton = document.getElementById('delete-btn');
  deleteButton.addEventListener("click", () => deleteCustomFormation());


  function deleteCustomFormation() {
    const formationSelect = document.getElementById("formation");
    const selectedOption = formationSelect.options[formationSelect.selectedIndex];

    if (selectedOption && confirm(`Are you sure you want to delete the formation '${selectedOption.value}'?`)) {
      const formationName = selectedOption.value;
      socket.emit("deleteFormation", formationName); // Emit the event to the server

      // Remove the deleted formation option from the dropdown
      formationSelect.removeChild(selectedOption);

      // Remove the formation from the local customFormations object
      delete customFormations[formationName];

      // Clear the selected option formatting
      formationSelect.selectedIndex = -1;
      updateFormation('default')
    }
  }


  socket.on("updateCustomFormations", (formations) => {
    customFormations = formations;
    updateFormationDropdown();
  });

  // Handle save button click event
  const saveBtn = document.getElementById("save-btn");
  saveBtn.addEventListener("click", () => {
    saveCustomFormation();
    updateFormationDropdown(); // Update the dropdown after saving a new custom formation
  });



  // Mobile Touch events:

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();

    for (const touch of e.touches) {
      const touchX = touch.pageX - rect.left;
      const touchY = touch.pageY - rect.top;

      // Check if the touch is over a player
      const player = players.find((player) => {
        const dx = player.x - touchX;
        const dy = player.y - touchY;
        return dx * dx + dy * dy < 20 * 20;
      });

      if (player) {
        activeTouches.push({ id: touch.identifier, player });
      }
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();

    for (const touch of e.touches) {
      const touchX = touch.pageX - rect.left;
      const touchY = touch.pageY - rect.top;
      const player = findPlayerByTouchId(touch.identifier);

      if (player) {
        player.x = touchX;
        player.y = touchY;
        drawPlayers();
        socket.emit("updatePlayerPosition", {
          id: players.indexOf(player),
          position: { x: touchX, y: touchY },
        });
      }
    }
  });

  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const player = findPlayerByTouchId(touch.identifier);
      if (player) {
        activeTouches = activeTouches.filter((touch) => touch.id !== touch.identifier);
      }
    }
  });

});