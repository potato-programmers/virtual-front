type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const startBtn = document.getElementById("recordStartBtn");
const stopBtn = document.getElementById("recordStopBtn");
const subtitleEl = document.getElementById("subtitle") as HTMLDivElement | null;

const modeBtn = document.getElementById("modeBtn");
const recordBox = document.getElementById("record-box");

if (modeBtn && recordBox) {
  let modeIndex = 0;
  const modes = ["수어 -> 문자", "문자 -> 수어"];

  modeBtn.innerText = `모드: ${modes[modeIndex]}`;
  recordBox.classList.remove("hidden");

  modeBtn.addEventListener("click", () => {
    modeIndex = (modeIndex + 1) % modes.length;
    modeBtn.innerText = `모드: ${modes[modeIndex]}`;

    if (modes[modeIndex] === "수어 -> 문자") {
      recordBox.classList.remove("hidden");
    } else {
      recordBox.classList.add("hidden");
    }
  });
}

const SpeechRecognitionClass =
  (window as Window &
    typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }).SpeechRecognition ||
  (window as Window &
    typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }).webkitSpeechRecognition;

const updateSubtitle = (text: string) => {
  if (!subtitleEl) return;
  subtitleEl.innerText = text.trim() || "인식된 문장이 여기에 표시됩니다.";
};

if (!SpeechRecognitionClass) {
  console.error("Web Speech API를 지원하지 않는 브라우저입니다.");
} else {
  const recognition = new SpeechRecognitionClass();
  recognition.lang = "ko-KR";
  recognition.continuous = true;
  recognition.interimResults = true;

  let isRecording = false;
  let finalTranscript = "";

  recognition.onstart = () => {
    console.log("🎤 onstart: 음성 인식 시작");
    updateSubtitle("음성을 듣는 중...");
  };

  recognition.onend = () => {
    console.log("🛑 onend: 음성 인식 종료");
    console.log("✅ 최종 인식 결과:", finalTranscript.trim());
    updateSubtitle(finalTranscript || "인식이 종료되었습니다.");

    finalTranscript = "";
    isRecording = false;
  };

  recognition.onerror = (e: { error: string }) => {
    console.error("❌ onerror:", e.error);
    updateSubtitle("음성 인식 중 오류가 발생했습니다.");
    isRecording = false;
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    // 새로 인식된 결과들만 처리
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const text = result[0].transcript;

      if (result.isFinal) {
        finalTranscript += text + " ";
        updateSubtitle(finalTranscript);
      }

      // console.log(result.isFinal ? "👉 확정된 문장:" : "⏳ 중간 인식:", text);
    }
  };

  startBtn?.addEventListener("click", () => {
    console.log("▶ start 버튼 클릭, isRecording =", isRecording);
    if (isRecording) return;

    try {
      isRecording = true;
      finalTranscript = ""; // 새 녹음 시작 시 초기화
      recognition.start();
      console.log("🎬 recognition.start() 호출");
    } catch (err: any) {
      console.log("start 중복 호출 예외:", err?.message);
      isRecording = false;
    }
  });

  stopBtn?.addEventListener("click", () => {
    console.log("⛔ stop 버튼 클릭, isRecording =", isRecording);
    if (!isRecording) return;

    try {
   
      recognition.stop();
      console.log("🛑 stop() 호출 (인식 마무리 후 onend 호출될 것)");
 
    } catch (err: any) {
      console.log("stop 예외:", err?.message);
    }
  });
}
