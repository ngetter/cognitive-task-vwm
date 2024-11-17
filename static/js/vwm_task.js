const task_data = {
  same_sample: 100,
  different_sample: 100,
  stimuli_array: [0, 1, 2, 3, 4, 5],
  set_size: 5,
  //times.

  fixation_interval: 500,
  memory_set: 500,
  memory_interval: 1000,
  
  //response
  same_key: "י",
  different_key: "ח"
}

const color_stimuli = [
  {color_code:'#E74C3C', color: "אדום", en_name: "red"},
  {color_code:'#F1C40F', color: "צהוב", en_name: "yellow"},
  {color_code:'#E67E22', color: "כתום", en_name: "orange"},
  {color_code:'#27AE60', color: "ירוק", en_name: "green"},
  {color_code:'#3498DB', color: "תכלת", en_name: "lightblue"},
  {color_code:'#9B59B6', color: "סגול", en_name: "purpule"}
]

function saveData(data){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/write_data'); // 'write_data.php' is the path to the php file described above.
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({filedata: data}));
  }


/*
Stimuli randomization and creation steps
*/

  // Helper function to generate all permutations of an array
function permute(arr) {
  if (arr.length <= 1) return [arr];
  const permutations = [];
  for (let i = 0; i < arr.length; i++) {
    const currentNum = arr[i];
    const remainingNums = arr.slice(0, i).concat(arr.slice(i + 1));
    const remainingPermutations = permute(remainingNums);
    for (const perm of remainingPermutations) {
      permutations.push([currentNum].concat(perm));
    }
  }
  return permutations;
}

// Step 1: Generate all permutations of [1, 2, 3, 4, 5, 6]
const allPermutations = permute(task_data.stimuli_array);
console.log("Total permutations: ", allPermutations.length)

// Step 2: Randomly sample 100 unique permutations from the first 200
const randomSampleSame = [];
for (let i = 0; i < task_data.same_sample; i++) {
  const index = Math.floor(Math.random() * allPermutations.length);
  randomSampleSame.push(allPermutations[index]);
}

const randomSampleDifferent = [];
for (let i = 0; i < task_data.different_sample; i++) {
  const index = Math.floor(Math.random() * allPermutations.length);
  randomSampleDifferent.push(allPermutations[index]);
}

// Step 3: Create `unselectedSample` by filtering out the sampled indices
// const unselectedSample = allPermutations;
// const randomSample = allPermutations;

// Step 4: Create a vector of the last elements of each sampled permutation
const lastElements = randomSampleDifferent.map(perm => perm[perm.length - 1]);

// Step 5: Map unselectedSample to the desired object structure
const unselectedSampleObjects = randomSampleSame.map(item => ({
  stimulus: item.slice(0,task_data.set_size),
  test: item.slice(0,task_data.set_size),
  answer: "same",
  condition: "old"
}));

// Step 6: Map randomSample to the desired object structure with modifications
const randomSampleObjects = randomSampleDifferent.map((element, index) => {
  // Clone the element to avoid modifying the original array
  const modifiedElement = [...element];
  
  // Ensure replacement to make `test` different from `stimulus`
  let randomIndex;
  randomIndex = Math.floor(Math.random() * modifiedElement.length - 2);
  // Replace the chosen index with the corresponding last element
  modifiedElement[randomIndex] = lastElements[index];
  
  // Return the object with the specified structure
  return {
    stimulus: element.slice(0,task_data.set_size),
    test: modifiedElement.slice(0,task_data.set_size),
    condition: "new",
    answer: "different"
  };
});

// Step 7: Merge randomSampleObjects and unselectedSampleObjects into test_stimuli
const test_stimuli = [...randomSampleObjects, ...unselectedSampleObjects];


/*****************
      END OF RANDOMIZATION
******************/

function createCircleOfDisks(colors, r, R) {
  // Calculate center of the page (assuming 100vw x 100vh dimensions)
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Number of disks
  const numDisks = colors.length;
  const angleIncrement = (2 * Math.PI) / numDisks;

  // Create the SVG element
  let svg = `<svg width="100vw" height="100vh" xmlns="http://www.w3.org/2000/svg">`;

  // Loop through colors to create each disk
  colors.forEach((color, i) => {
    const angle = i * angleIncrement;
    const x = centerX + R * Math.cos(angle);
    const y = centerY + R * Math.sin(angle);
    svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" />`;
  });

  // Close the SVG tag
  svg += `</svg>`;

  // Insert the SVG into the page
  return svg;
}
  
var jsPsych = initJsPsych({
    on_finish: function() {
      // jsPsych.data.displayData();
      // saveData(jsPsych.data.get());
    }
  });
  
var timeline = [];



// Survey with a single text entry question.
const survey_json = {
  pages: [

    {
      name: "page_1",
      // title: "colors",
  elements: [
    {
        name: 'caption',
        type: 'html',
        html: `
  <p>אנא דרג את הצבעים הבאים לפי סדר ההעדפה/החיבור שלך אליהם</p>
  <p>המועדף ביותר - 1<br>הכי פחות מועדף - 6</p>
  <p>לנוחיותך מצורף סרגל הצבעים</p>
  <img src="img/colors.png" />`
    },
    {
    name: "rank_colors",
    // title: "דרג את הצבעים לפי סדר העדפה",
    type: "ranking",
    choices: color_stimuli.map(i=>{
      return {
        value: i.en_name,
        text:`${i.color}`
      }
    })
  }]
},
{
  name: "page2",
  // title: "מקצועע",
  elements: [{

    title: "לאיזה תחום שייך המקצוע שבו אתה עוסק?",
    name: "profession",
    type: "radiogroup",
    colCount: 1,
    choices: [
      {text: "תחום אומנותי או עיצובי",value: "ART"}, 
      {text: "תחום הרפואה", value: "MED"},
      {text: "תחום חינוכי או טיפולי", value: "EDU"},
      {text: "תחום טכני/מדעי/טכנולוגי",value: "TECH"},
      {text: "עיסוק משרדי",value: "OFFICE"},
      {text: "תחום שיווק ומכירות", value: "SALE"},
      {text: "תחום ניהולי או עסקי", value: "BIZ"}
    ]

  }]


}]
};



function mapStimuliToColors(stimuliArray) {
    return stimuliArray.map(item => ({
      ...item,
      stimulus: item.stimulus.map(index => color_stimuli[index].color_code),
      test: item.test.map(index => color_stimuli[index].color_code),
      stimulus_names: item.stimulus.map(index => color_stimuli[index].en_name),
      test_names: item.test.map(index => color_stimuli[index].en_name)

    }));
  }
  
  // Convert the test_stimuli array

const mapped_indexes_to_colors = mapStimuliToColors(test_stimuli);

// Map stimuli to corresponding SVG containers
function mapStimuliToSVG(stimuliArray) {
  return stimuliArray.map(item => ({
    ...item,
    pair: [createCircleOfDisks(item.stimulus, 20, 150), createCircleOfDisks(item.test, 20, 150)],
  }));
}

// Convert the test_stimuli array with SVG containers
const mapped_test_stimuli = mapStimuliToSVG(mapped_indexes_to_colors);



/***************************************************************
 * Build timeline
 */
 

timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  button_label: "מעבר למסך מלא",
  message: "<p>הניסוי יערך במסך מלא. בלחיצה על הכפתור הדפדפן יעבור למסך מלא והניסוי יתחיל</p>"
})

var greetings = {
  type: jsPsychImageKeyboardResponse,
  stimulus: "img/liel_greetings.jpg",
  record_data: false
};

timeline.push(greetings);

/*set up instructions block*/
// var instructions = {
//   type: jsPsychHtmlKeyboardResponse,
//   stimulus: "<p>In this task, you will see five colored circles on the screen, like the example below followed by same or different circle.</p>"+
//   "<img src='img/inc1.png'></img>"+
//   "<p>Press the 's' key if the stimuli are the same. </p>"+
//   "<p>Press the 'd' key if there is a change in the second stimuli</p>"+
//   "<p>Press any key to begin.</p>",
//   post_trial_gap: 2000,
//   record_data: false,

// };


var instructions = {
  type: jsPsychImageKeyboardResponse,
  stimulus: "instructions.jpg",
  record_data: false
};

timeline.push(instructions);

var feedback = {
  type: jsPsychHtmlKeyboardResponse,
  trial_duration: 1000,
  record_data: false,
  stimulus: function(){
    // The feedback stimulus is a dynamic parameter because we can't know in advance whether
    // the stimulus should be 'correct' or 'incorrect'.
    // Instead, this function will check the accuracy of the last response and use that information to set
    // the stimulus value on each trial.
    var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct;
    if(last_trial_correct){
      return "<p>Correct!</p>"; // the parameter value has to be returned from the function
    } else {
      return "<p>Wrong.</p>"; // the parameter value has to be returned from the function
    }
  }
}

var fixation = {
  type: jsPsychHtmlKeyboardResponse,
  trial_duration: task_data.fixation_interval,
  record_data: false,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: "NO_KEYS" 
}

var trial_timeline = {
  type: jsPsychSameDifferentHtml,

  stimuli: jsPsych.timelineVariable('pair'),
  same_key: task_data.same_key,
  different_key: task_data.different_key,
  first_stim_duration: task_data.memory_set,
  gap_duration: task_data.memory_interval,
  second_stim_duration: null,
  answer: jsPsych.timelineVariable('answer'),
  data: {
    mem_colors: jsPsych.timelineVariable('stimulus_names'),
    test_colors: jsPsych.timelineVariable('test_names'),
  }
}

var trial = {
    timeline: [fixation, trial_timeline, feedback],
    timeline_variables: mapped_test_stimuli,
    randomize_order: true,
    repetitions: 1
}
timeline.push(trial);

const survey_trial = {
  type: jsPsychSurvey,
  survey_json: survey_json
};

timeline.push(survey_trial);

var thanx = {
  type: jsPsychImageKeyboardResponse,
  stimulus: "img/liel_thanx.jpg",
  record_data: true,
  trial_duration: 1500,
  data: {
    patient_reached_end: true
  }
};

timeline.push(thanx);

timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: false,
})

jsPsych.run(timeline);