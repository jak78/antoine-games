
// tuyau escape  - Version 1
// Notre premier vaisseau spatial !

// Cette fonction est exécutée une seule fois
async function setup() {
  createCanvas(900, 600);
  vaisseau = await loadImage('vaisseau.png');
  tuyau = await loadImage('obstacle_3_reacteur_energetique.png');
  pause_img = await loadImage('pause.png')
  fond_etoiles= await loadImage('01_etoiles.png')
  fond_planetes= await loadImage('04_planetes_premier_plan.png')
  game_over_img = await loadImage('game_over.png')
  resetGame()
}

function resetGame() {
  speed_origine = 2.3;
  acceleration_origine = 0.001;
  speed = speed_origine;
  acceleration = acceleration_origine;
  
  pause = false
  gameover = false
  gameoverTime = 0

  spaceship_x = 10
  spaceship_y = 150
  spaceship_w = 190
  spaceship_h = 100
 
  fond_etoilesX=0
  fond_etoilesX2=600
  fond_planetesX=0

  tuyauX=370
  tuyauX2=800
  tuyauY=300
  tuyauY2=0
  tuyau_w = 100
  tuyau_h = 300  
}

function makeGameOver() {
  if(gameover) return
  speed = 0
  acceleration = 0
  gameover = true
  gameoverTime = millis()
}

function displayGameOver() {
  image(game_over_img, 200, 150, 500, 300);
}
function displayPause() {
  image(pause_img, 200, 220, 500, 150);
}


// Cette fonction est exécutée en boucle
function draw() {

  // Commandes du vaisseau
  if (!pause && !gameover) {
    spaceship_y = mouseY
    if (mouseY >500) {spaceship_y =500}
  }

  // 1. Dessiner le fond spatial
  background(0,0,0)
  image(fond_etoiles,fond_etoilesX,0,900,600)
  image(fond_etoiles,fond_etoilesX+900,0,900,600)
  image(fond_planetes,fond_planetesX,0,900,600)
  image(fond_planetes,fond_planetesX+900,0,900,600)
  
  // Dessin des sprites
  image(vaisseau, spaceship_x, spaceship_y, spaceship_w, spaceship_h);
  image(tuyau,tuyauX,tuyauY,tuyau_w,tuyau_h)
  image(tuyau,tuyauX2,tuyauY2,tuyau_w,tuyau_h)
  if(pause) {
    displayPause()
  }
  if(gameover) {
    displayGameOver()
  }
  
  // Coordonnées des obstacles :
  tuyauX = tuyauX - speed
  tuyauX2 = tuyauX2 - speed 
  if(tuyauX < -100) {
    tuyauX = 900
    if(tuyauY2 == 0) {
      pos_autorisee_1 = 150
      pos_autorisee_2 = 300
    }
    if(tuyauY2 == 150) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 300
    }
    if(tuyauY2 == 300) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 150
    }
    if(Math.random() < 0.5) {
      tuyauY = pos_autorisee_1
    } else {
      tuyauY = pos_autorisee_2
    }    
  }
  if(tuyauX2 < -100) {
    tuyauX2 = 900
    if(tuyauY == 0) {
      pos_autorisee_1 = 150
      pos_autorisee_2 = 300
    }
    if(tuyauY == 150) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 300
    }
    if(tuyauY == 300) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 150
    }
    if(Math.random() < 0.5) {
      tuyauY2 = pos_autorisee_1
    } else {
      tuyauY2 = pos_autorisee_2
    }
  }

  // Parallaxes :
  fond_etoilesX=fond_etoilesX-speed/5
  if (fond_etoilesX< -900) {fond_etoilesX = 0}
  fond_planetesX=fond_planetesX-speed/2
  if (fond_planetesX< -900) {fond_planetesX = 0}
    
  // Accélération :
  speed=acceleration + speed

  // Détection de collision :
  nose_x = spaceship_x + spaceship_w
  nose_y = spaceship_y + ( spaceship_h / 2 )
  if( (nose_x >= tuyauX ) && ( nose_x <= tuyauX + tuyau_w ) 
      && 
      (nose_y >= tuyauY ) && (nose_y <= tuyauY + tuyau_h)
  ) {
    makeGameOver()
  }
  nose_x = spaceship_x + spaceship_w
  nose_y = spaceship_y + ( spaceship_h / 2 )
  if( (nose_x >= tuyauX2 ) && ( nose_x <= tuyauX2 + tuyau_w ) 
      && 
      (nose_y >= tuyauY2 ) && (nose_y <= tuyauY2 + tuyau_h)
  ) {
    makeGameOver()
  }

  if(gameover && (millis() - gameoverTime >= 3000)) {
    resetGame()
  }
}

function switchPause() {
  if(gameover) return
  if(pause) {
    // On est en pause donc on enlève la pause
    // On doit donc remettre la vitesse et l'accélération d'avant la pause
    acceleration = saved_acceleration
    speed = saved_speed
    pause = false
  } else  {
    // Si on arrive ici, c'est qu'on est pas en pause, donc on met pause
    // On sauvegarde d'abord la vitesse et l'acceleration
    saved_speed = speed
    saved_acceleration = acceleration
    // Puis on fige le jeu
    speed = 0
    acceleration = 0
    pause = true
  }
}
function keyPressed() {
  if (key === ' ') {
    switchPause()
  }
}