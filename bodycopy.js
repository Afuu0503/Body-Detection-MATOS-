let video; 
let poseNet;
let pose;
let skeleton;
let brain;
let state = 'waiting'; //wartość potrzebna do funkcji odpalanej po jakimś czasie
let targetLabel;

/* Funkcja, która pozwala mi odpalić program 
po czasie 10s */
function keyPressed(){
    if (key == 's'){
        brain.saveData();//kiedy wciśniemy klawisz s nasz program zapisuje informacje wejściowe
    }   else {
    targetLabel = key;
    console.log(targetLabel); //po wciśnięciu jakiegokolwiek klawisza...
    setTimeout(function() { //program się odpala z opóźnieniem 10s
        console.log('collecting');
        state = 'collecting';
        setTimeout(function() { //program się wyłącza
            console.log('not collecting');
            state = 'waiting';
        }, 10000)
    }, 10000)
}
}
function setup(){
    createCanvas(640, 480);
    video = createCapture(video);
    video.hide();
    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose', gotPoses);

    let options = {
        inputs: 34,
        outputs: 4,
        task: 'classification',
        debug: true
    }
    brain = ml5.neuralNetwork(options); 
}
function gotPoses(poses){
    //console.log(poses);
    if (poses.length > 0){
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
        
        if (state == 'collecting'){
        let inputs = [];
            for(let i=0; i<pose.keypoints.length; i++){
                let x = pose.keypoints[i].position.x;
                let y = pose.keypoints[i].position.y;
                    inputs.push(x);
                    inputs.push(y);
            }
        let target = [targetLabel];     
        brain.addData(inputs, target);//inputs 34 pozycji (x i y - 17)
        }
    }
}
function modelLoaded(){
    console.log('poseNet ready');
}
function draw(){
    translate(video.width, 0);
    scale(-1, 1);
    image(video, 0,0, video.width, video.height);

    if (pose){
        for (let i=0; i < skeleton.length; i++) {
            let a = skeleton[i][0];
            let b = skeleton[i][1];
            strokeWeight(2);
            stroke(0);

            line(a.position.x, a.position.y, b.position.x, b.position.y);
        }
    
    }
 }