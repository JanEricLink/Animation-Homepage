let nMode = false;
function changeNightMode() {
  let root = document.styleSheets[1].cssRules[0];
  if (nMode) {
    root.style.setProperty("--backgroundcolor", "rgb(240,240,240)");
    root.style.setProperty("--textcolor", "rgb(63,63,63)");
    root.style.setProperty("--primary", " rgba(255,235,60,0.6)");
    document.getElementById("nModeButton").innerHTML = "🌙";
    nMode = false;
  } else {
    root.style.setProperty("--backgroundcolor", "rgb(63,63,63)");
    root.style.setProperty("--textcolor", "rgb(240,240,240)");
    root.style.setProperty("--primary", "rgba(60,235,255,0.6");
    document.getElementById("nModeButton").innerHTML = "☀️";
    nMode = true;
  }
}

function changeAnimationToTrig() {
  let iframe = document.getElementById("animationFrame");
  iframe.src = "https://janericlink.github.io/Trig-Animation/";
  iframe.title = "Animation of the Trigonometric Functions";
}

function changeAnimationToWater() {
  let iframe = document.getElementById("animationFrame");
  iframe.src = "https://janericlink.github.io/Water-Wave-Animation/";
  iframe.title = "Animation of a Water Wave";
}

function changeAnimationToSound() {
  let iframe = document.getElementById("animationFrame");
  iframe.src = "https://janericlink.github.io/Sound-Wave-Animation/";
  iframe.title = "Animation of a Sound Wave";
}
