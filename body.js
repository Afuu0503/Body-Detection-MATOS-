/* Jako funkcję biblioteki ml5.js wybrałam PoseNet. Input zastosowany to widok z kamerki, któremu przypisany jest tak zwany "patyczak". 
Dzięki takiej reprezentacji mogłam wykorzystać dane wektorowe z pozycji obiektu na canvasie, sieci neuronowe do uczenia programu wykrywania pozycji 
i przypisywanie im odpowiednich liter.  */
let video; 
let poseNet;
let pose;
let skeleton;
let brain;
let poseLabel = "M";
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
//funkcja do której wrzucamy wszystkie informacje o programie
function setup(){
    createCanvas(640, 480);
    video = createCapture(video);//pobieranie obrazu z kamery
    video.hide();
    poseNet = ml5.poseNet(video, modelLoaded); //pobieranie informacji z biblioteki ml5.js w formie video i zastosowanie modelLoaded, które będzie później wyjaśnione jako osobna funkcja
    poseNet.on('pose', gotPoses);


    let options = {
        inputs: 34, //mamy po 17 pozycji x i po 17 pozycji y 
        outputs: 5, // mamy pięć różnych przetrenowanych przez nas pozycji 
        task: 'classification',
        debug: true
    }
    brain = ml5.neuralNetwork(options); //funkcja która pozwala programowi się uczyć
    const modelInfo = {
        model: 'model/model.json',//tutaj są wyuczone przeze mnie pozycje powielone o uczenie maszynowe
        metadata: 'model/model_meta.json',
        weights: 'model/model.weights.bin',
      };
      brain.load(modelInfo, brainLoaded);//załadowanie wyuczonego modelu (obraz w konsoli w formie wykresu)

    //brain.loadData('mato.json', dataReady);//załadowanie wyuczonego przez nas widoku z kamery
}
function brainLoaded(){//funkcja która odpala klasyfikację sieci neuronowych
    console.log('Pose classification ready!');
    classifyPose();
}
function classifyPose(){ //funnkcja która przypisuje do konkretnego klawisza z klawiatury pozycje 
    if(pose) {
    let inputs = [];
    for(let i=0; i<pose.keypoints.length; i++){
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
            inputs.push(x);
            inputs.push(y);
    }
    brain.classify(inputs, gotResult);//inputs to są elementy zaciągnięte z x i y z canvasa wykorzystywane do uczenia
    } else{
        setTimeout(classifyPose, 100); //w wypadku, gdy program nie odczyta położenia ma poczekać i odczytać na nowo położenie
    }
}
function gotResult(error, results){//funkcja wyświetlająca efekty działań 
    poseLabel = results[0].label;
    console.log(results[0].confidence);
    classifyPose();

}
function dataReady(){//tworzenie danych - obróbka 
    brain.normalizeData(); //wymiary 640x480 muszą być zapisane w przedziale 0-1
    brain.train({epochs: 100}, finished); //program konwertuje 100 razy dane w nim zawarte do uczenia maszynowego
}
function finished(){
    console.log('model trained');
    brain.save();//zapisanie wyuczonego modelu
}

function gotPoses(poses){//funkcja dokładnie określająca pozycję szkieleciku i przypisująca ją do położenia na canvasie
    //console.log(poses);
    if (poses.length > 0){
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
        
        if (state == 'collecting'){

        let target = [targetLabel];     
        brain.addData(inputs, target);//inputs 34 pozycji (x i y - 17)
        }
    }
}
function modelLoaded(){//funkcja biorąca informacje, że model został zapisany i daje informacje w consoli 
    console.log('poseNet ready');
}
function draw(){//funkcja wypisująca na ekranie dokładny wygląd programu 
    push(); //nieodwracanie tekstu
    translate(video.width, 0);
    scale(-1, 1);
    image(video, 0,0, video.width, video.height);

    if (pose){//szkielecik
        for (let i=0; i < skeleton.length; i++) {
            let a = skeleton[i][0];
            let b = skeleton[i][1];
            strokeWeight(2);
            stroke(0);

            line(a.position.x, a.position.y, b.position.x, b.position.y);
        }
        for (let i=0; i < pose.keypoints.length; i++){
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        fill(0);
        stroke(255);
        ellipse(x, y, 16, 16);
        }
    }
    pop (); //tekst zawsze na środku 
    fill(255, 0, 255);
    noStroke();
    textSize(256);
    textAlign(CENTER, CENTER);
    text(poseLabel, width/2, height/2);
 }

 /*
 Komentarz do zadania:
 PoseNet to funkcja biblioteki, która pozwala wykrywać ciało człowieka i uczyć się jego położenia 
 Zastosowanie:
    gry komputerowe typu just dance
    wykrywanie ludzi w autonomicznych pojazdach? 
    sterowanie gestem np. telefonu

 Pix2Pix jest to funkcja biblioteki, która pozwala zamieniać input obrazu, wykryć dany element i zastąpić go innym wyuczonym obiektem 
 Zastosowanie:
    Autonomiczne pojazdy? - mapa przestrzenna 
    Programy do obróbki obrazu - Gaugan 
    Programy do tworzenia obiektów wektorowych - ikony do wykorzystania webowego 

 Word2Vec odczytuje daną nazwę i konwertuje ją na liczbę lub co za tym idzie wektor
 Zastosowanie:
    Tworzenie grafów 
    Analiza danych (i prognozowanie?)
    Mapy kosmosu?

 Face-Api to funkcja wykrywająca twarz. 
 Zastosowanie:
    odblokowywanie telefonu, tabletu lub komutera za pomocą twarzy 
    Wykrywanie emocji z eyetrackera przy badaniach 
    Aplikacja, która koncentruje wzrok na kamerze, gdy w żeczywistości czytamy coś z kartki 
    
 Handpose to trackowanie dłoni 
 Zastosowanie: 
    Gry z rozszerzoną rzeczywistością
    Roboty medyczne 

 BodyPix to wykrywanie elementów całego ciała 
    pojazdy autonomiczne
    Projektowanie 3d - mapowanie ruchów aktora w celu nałożenia obiektu 3d 
    wyciąganie sylwetki i wrzucanie jej na inne tła - vfx movies

 Sentiment jest formą "obietnicy". Jest to przykład działania asynchronicznego. Możemy "zamówić" sobie coś - np. pizzę - i program 
 albo nam potwierdzi przyjęcie zamówienia, albo go odrzuci.  
 Zastosowanie: 
    potwierdzenia zamówień 
    Ranking ulubionych filmów 
    Statystyka

 StyleTransfer łączy ze sobą dwie wybrane grafiki
 Zastosowanie: 
    Concept art 
    projektowanie patternów na ubrania
 */