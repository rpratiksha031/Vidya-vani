const textToSpeech = (text) => {
  if ("speechSynthesis" in window) {
    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speech);
  } else {
    alert("Browser does not support text-to-speech");
  }
};

export default textToSpeech;
