function saveData(data){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/write_data'); // 'write_data.php' is the path to the php file described above.
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({filedata: data}));
  }

var jsPsych = initJsPsych({
    on_finish: function() {
    //   jsPsych.data.displayData();
      saveData(jsPsych.data.get());
    }
  });
  
var timeline = [];

const color_stimuli = [
  'img/blue.png',
  'img/green.png',
  'img/yellow.png',
  'img/purple.png',
  'img/red.png',
  'img/orange.png'
]

/* preload images */
var preload = {
    type: jsPsychPreload,
    images: color_stimuli,
    record_data: false,
    }
    timeline.push(preload);

const test_stimuli = [
{
  stimulus: [0, 1, 2, 3, 4],
  test: [0, 1, 2, 3, 5],
  target_present: true,
  condition: 'new',
},

{
    stimulus: [0, 1, 2, 3, 4],
    test: [0, 1, 2, 3, 4],
    target_present: false,
    condition: 'old',
},

];


function mapStimuliToColors(stimuliArray) {
    return stimuliArray.map(item => ({
      ...item,
      stimulus: item.stimulus.map(index => color_stimuli[index]),
      test: item.test.map(index => color_stimuli[index])
    }));
  }
  
  // Convert the test_stimuli array

const mapped_test_stimuli = mapStimuliToColors(test_stimuli);

var welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Welcome to the experiment. Press any key to begin.",
  record_data: false,

};

/*set up instructions block*/
var instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<p>In this task, you will see five colored circles on the screen, like the example below.</p>"+
  "<img src='img/inc1.png'></img>"+
  "<p>Press the left arrow key if the middle arrow is pointing left. (<)</p>"+
  "<p>Press the right arrow key if the middle arrow is pointing right. (>)</p>"+
  "<p>Press any key to begin.</p>",
  post_trial_gap: 2000,
  record_data: false,

};
timeline.push(instructions);

var memorize = {
    type: jsPsychVisualSearchCircle,
    stimuli: jsPsych.timelineVariable('stimulus'),
    fixation_image: 'img/fixation.png',
    trial_duration: 700,
    fixation_duration: 0,
    response_ends_trial: false,
    target_present: null,
    record_data: false,
    data: {
        task: 'memorize'
      }
}


var inter_trial_interval = {
type: jsPsychHtmlKeyboardResponse,
stimulus: '<div style="font-size:60px;"></div>',
choices: "NO_KEYS",
trial_duration: 1000,
record_data: false,
data: {
    task: 'inter_trial_interval'
}
};

var test = {
  type: jsPsychVisualSearchCircle,
  stimuli: jsPsych.timelineVariable('test'),
  fixation_image: 'img/fixation.png',
  target_present: jsPsych.timelineVariable('target_present'),
  fixation_duration: 1000,
  // post_trial_gap: 1000,
  data: {
    task: 'test', 
    condition: jsPsych.timelineVariable('condition'),
    memorize_colors:  jsPsych.timelineVariable('stimulus'),
    test_colors:  jsPsych.timelineVariable('test')
  }
}

var trial = {
    timeline: [memorize, test, inter_trial_interval],
    timeline_variables: mapped_test_stimuli,
    randomize_order: true,
    repetitions: 2
}
timeline.push(trial);

jsPsych.run(timeline);