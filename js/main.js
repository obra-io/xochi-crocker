/* Project: Xochi Crocker Art, SRA */
/* Author: Brandon Ortiz */
/* ID: 2018-Obra-AN27 */

var timeout;

const gaze_origin = [415, 220];

const pupil_left_origin = [190, 410];
const pupil_right_origin = [259, 417];

const feature_info = [  "Bailarina de la Muerte: She dances, she curtseys, but our baiilarina de la Muerte is a reminder of so much more. This tutu dawning dancer is an ode to the Mexican holiday, Dia de Los Muertos, celebrating friends and families who have passed while also supporting their spiritual journey. She serves as a momento mori, for both life and death as a sheared experience.",
                        "Embryo: With our Baby in Bloom, artist Tino Rodriguez highlights the importance of the lotus flower as a key part of Eastern philosophy, particularly Buddhism, symbolizing life itself. The embryo emphasizes this further adding to Tino’s belief that “out of water emerges life”. \[This rock-a-bye-baby, has dual meanings about…\]",
                        "Golden Phoenix: This gold feathered, wing flapping, flying [fowl] is Tino’s artistic depiction of freedom of choice and movement. Beyond it’s beauty, the deeper meaning of this character is rooted in what Tino calls being a “citizen of the world”; The belief that the world is a shared home to all and all should be treated accordingly.",
                        "Nijinsky: Our blue fiddle wielding friend, is Rodriguez’s homage to both the Hindu deity, Krishna, as well as the eccentric, 20th century, Russian born ballet dancer, Vaslav Nijinsky. This cross-cultural fusion highlights Tino’s appreciation of both entities as “lords of the arts”. With Nijinsky often cited as one of the greatest dancers of his era, and Krishna and his legendary flute, said to drive out negativity and promote inner peace, this character speaks volumes to the power of art to bring happiness and wellbeing.",
                        "Hummingbird: In Tino Rodriguez’s Xochipilli’s Ecstatic Universe, this pint sized green hummingbird is more than meets the eye. In ancient Aztec religion, Huitzilpotchtli is a deity of war and sun, that often represented in the form of a Hummingbird, which Tino captures here. Legend has it the bravest of warriors that gave it all on the battlefield were transformed into hummingbirds upon their passing and joined Huitzilpotchtli in the afterlife."
                      ];

const gaze_left_normals = 
[[7, 0],      /* 0 degrees */
 [0, 12],     /* 90 degrees */
 [-20, 0],    /* 180 degrees */
 [0, -8]];    /* 270 degrees */

const gaze_right_normals = 
[[12, 0],     /* 0 degrees */
 [0, 10],     /* 90 degrees */
 [-10, 0],    /* 180 degrees */
 [0, -5]];    /* 270 degrees */

const gaze_limits = [360, 95, -620, -1200];

function calcGazeAngle(x_pos, y_pos) {
  var x_component = x_pos - gaze_origin[0];
  var y_component = -(y_pos - gaze_origin[1]);

  /* Find gaze angle */
  var angle = Math.atan2(y_component, x_component);
  
  /* Adjust angle to be relative to gaze origin */
  if (angle < 0) {
    angle += 2 * Math.PI;
  }  

  return angle;
}

function calcGazeDistancePercent(x_pos, y_pos, angle) {
  var gaze_distance_percent = [0.0, 0.0];
  var x_component = x_pos - gaze_origin[0];
  var y_component = -(y_pos - gaze_origin[1]); 

//  alert(x_component + " " + y_component);

  /* Determine distance from the gaze quadrant limits */
  if (angle < ((1 / 2) * Math.PI)) {
    gaze_distance_percent[0] = x_component / gaze_limits[0];
    gaze_distance_percent[1] = y_component / gaze_limits[1];    
  } else if (angle < Math.PI) {
    gaze_distance_percent[0] = x_component / gaze_limits[2];
    gaze_distance_percent[1] = y_component / gaze_limits[1];   
  } else if (angle < ((3 / 2) * Math.PI)) {
    gaze_distance_percent[0] = x_component / gaze_limits[2];
    gaze_distance_percent[1] = y_component / gaze_limits[3];   
  } else {
    gaze_distance_percent[0] = x_component / gaze_limits[0];
    gaze_distance_percent[1] = y_component / gaze_limits[3]; 
  }

  return gaze_distance_percent;
} 

function calcGazeVector(normals, angle) {  
  var vector = [0, 0];
  var x_flip = 1;
  var y_flip = 1;  
  var elipse_a = 0;
  var elipse_b = 0;

  /* Determine an elipse from the gaze quadrant normals */
  if (angle < ((1 / 2) * Math.PI)) {
    elipse_a = normals[0][0];
    elipse_b = normals[1][1];
  } else if (angle < Math.PI) {
    elipse_a = normals[2][0];
    elipse_b = normals[1][1];

    x_flip = -1;
  } else if (angle < ((3 / 2) * Math.PI)) {
    elipse_a = normals[2][0];
    elipse_b = normals[3][1];

    x_flip = -1;
    y_flip = -1;
  } else {
    elipse_a = normals[0][0];
    elipse_b = normals[3][1];
    
    y_flip = -1;
  }

  /* Use parametric elipse equation to find gaze vector points */
  vector[0] = (elipse_a * Math.cos(angle)) * x_flip;
  vector[1] = (elipse_b * Math.sin(angle)) * y_flip;
  
  return vector;
} 

function moveEyes(x_pos, y_pos) {  
  /* Calculate gaze angle */
  var gaze_angle = calcGazeAngle(x_pos, y_pos);

  /* Calculate gaze distance */
  var gaze_distance_percent = calcGazeDistancePercent(x_pos, y_pos, gaze_angle);

  /* Find gaze vector */
  var gaze_left_vector = calcGazeVector(gaze_left_normals, gaze_angle);
  var gaze_right_vector = calcGazeVector(gaze_right_normals, gaze_angle );  
  
 /* Calculate pupil coords by scaling gaze vector with distance */
  var pupil_left_coords = [(gaze_left_vector[0] * gaze_distance_percent[0]) + pupil_left_origin[0],
                          (gaze_left_vector[1] * gaze_distance_percent[1] * -1) + pupil_left_origin[1]];

  var pupil_right_coords = [(gaze_right_vector[0] * gaze_distance_percent[0] + pupil_right_origin[0]),
                          (gaze_right_vector[1] * gaze_distance_percent[1] * -1) + pupil_right_origin[1]];

  $('#pupil-l').animate({
    left: pupil_left_coords[0],
    top: pupil_left_coords[1]
  }, 500);

  $('#pupil-r').animate({
    left: pupil_right_coords[0],
    top: pupil_right_coords[1]
  }, 500);
}

function focusOnFeature(feature, id) {
  feature.fadeIn(500); 
  
  $('#infobox').text(feature_info[id]);
 
  $('.callout').delay(500).show(0);  
  
  $('.artwork').delay(500).css("filter", "blur(.5px) grayscale(80%)");
    
  timeout = setTimeout(function(){ focusOnBackground(); }, 10000);
}

function focusOnBackground() {
  clearTimeout(timeout);

  timeout = null;
  
  $('.artwork').css("filter", "");
  
  $('.feature').hide(0);  
  $('.callout').hide(0); 
}

$(document).ready(function() {
  $('.canvas').click(function(e) {
    var offset = $(this).offset();
    var x_pos = e.pageX - offset.left;
    var y_pos = e.pageY - offset.top;

    if (timeout) {              
      focusOnBackground();
    } else {
      moveEyes(x_pos, y_pos);

      if ((x_pos >= 950) && (x_pos <= 1030) && (y_pos >= 700) && (y_pos <= 840)) {
        focusOnFeature($('#f1'), 0);
      } else if ((x_pos >=1100) && (x_pos <= 1230) && (y_pos >= 650) && (y_pos <= 900)) {
        focusOnFeature($('#f2'), 1);
      } else if ((x_pos >=1050) && (x_pos <= 1330) && (y_pos >= 100) && (y_pos <= 400)) {
        focusOnFeature($('#f3'), 2);
      } else if ((x_pos >=1150) && (x_pos <= 1300) && (y_pos >= 500) && (y_pos <= 700)) {
        focusOnFeature($('#f4'), 3);
      } else if ((x_pos >=500) && (x_pos <= 850) && (y_pos >= 50) && (y_pos <= 200)) {
        focusOnFeature($('#f5'), 4);
      }
    }      
  });
});
