



document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const positionBtn = document.getElementById("position-btn");
  const ctx = canvas.getContext("2d");
  const socket = io();
  let isDragging = false;
  let offsetX, offsetY, currentDraggable;
  canvas.style.background='#6ce76c'
  // // Player positions data
  let players = [
    { x: 50, y: 50 },    
    { x: 150, y: 50 },   
    { x: 250, y: 50 },   
    { x: 350, y: 50 },   
    { x: 450, y: 50 },   
    { x: 550, y: 50 },   
    { x: 650, y: 50 },   
    { x: 750, y: 50 },   
    { x: 850, y: 50 },   
    { x: 950, y: 50 },   
    { x: 1050, y: 50 },  
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
      console.log(" player.x ",selectedFormation[index].x);
      player.y = selectedFormation[index].y;
    });
  
    // Emit the updated formation to the server
    drawPlayers()
    socket.emit("updateFormation", formation);
  }

  // Handle formation change event
  const formationSelect = document.getElementById("formation");
  formationSelect.addEventListener("change", () => {
    const selectedFormation = formationSelect.value;
    updateFormation(selectedFormation);
  });

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

  positionBtn.addEventListener('click',()=>{
    let jsonText = "[";
  players.forEach((player) => {
    jsonText += `{x:${player.x},y:${player.y}},`;
  });
  jsonText += "]";
  console.log(jsonText);
  })

  // socket.on("updateFormation", (formation) => {
  //   const formationSelect = document.getElementById("formation");
  //   formationSelect.value = formation;
  //   updateFormation(formation);
  // });


  // Handle incoming data from the server to update player positions
  socket.on("updatePlayerPosition", (data) => {
    const { id, position } = data;
    players[id].x = position.x;
    players[id].y = position.y;
    drawPlayers();
  });
});