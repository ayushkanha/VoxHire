import { useState, useEffect, useRef } from "react";
import {
  Shield,
  ChevronDown,
  ArrowRight,
  User,
  Mail,
  Briefcase,
  Upload,
  Mic,
  StopCircle,
  RotateCcw,
  Send,
  CheckCircle2,
  Headphones,
  Loader2,
  Eye,
  AlertTriangle,
  Camera,
  CameraOff,
} from "lucide-react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import Results from './Results';

const API_BASE_URL = "https://voxhire.onrender.com/api";
const TOTAL_QUESTIONS = 2;

interface SuspiciousActivity {
  type: string;
  timestamp: number;
  description: string;
}

export default function VoxHireApp() {
  const [showInterview, setShowInterview] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultsSessionId, setResultsSessionId] = useState("");
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    photo: null as string | null,
    role: "frontend",
  });
  const [sessionId, setSessionId] = useState("");

  const startNewSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/start`);
      const data = await response.json();
      setSessionId(data.session_id);
      setShowInterview(true);
    } catch (error) {
      console.error("Failed to start session:", error);
      console.error("Failed to connect to backend. Make sure the server is running at http://127.0.0.1:8000");
    }
  };

  if (showInterview) {
    return (
      <InterviewPage
        name={userDetails.name}
        email={userDetails.email}
        photo={userDetails.photo}
        role={userDetails.role}
        sessionId={sessionId}
        onBack={() => {
          setShowInterview(false);
          setSessionId("");
        }}
        onFinishInterview={(finalSessionId, violations) => {
          setShowInterview(false);
          setResultsSessionId(finalSessionId);
          setSuspiciousCount(violations);
          setShowResults(true);
        }}
      />
    );
  }

  if (showResults) {
    return (
      <Results
        sessionId={resultsSessionId}
        onBack={() => setShowResults(false)}
        name={userDetails.name}
        email={userDetails.email}
        photo={userDetails.photo}
        role={userDetails.role}
        totalQuestions={TOTAL_QUESTIONS}
        suspiciousActivities={suspiciousCount}
      />
    );
  }

  return (
    <SetupPage
      userDetails={userDetails}
      setUserDetails={setUserDetails}
      onStart={startNewSession}
    />
  );
}

function SetupPage({
  userDetails,
  setUserDetails,
  onStart,
}: {
  userDetails: { name: string; email: string; photo: string | null; role: string };
  setUserDetails: (details: any) => void;
  onStart: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserDetails({ ...userDetails, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const showCustomAlert = (message: string) => {
    console.warn("Validation Error:", message);
    alert(message);
  };

  const handleStartInterview = () => {
    if (!userDetails.name.trim()) {
      showCustomAlert("Please enter your name");
      return;
    }
    if (!userDetails.email.trim()) {
      showCustomAlert("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email)) {
      showCustomAlert("Please enter a valid email address");
      return;
    }
    onStart();
  };

  const roleLabel = userDetails.role.charAt(0).toUpperCase() + userDetails.role.slice(1).replace(/([A-Z])/g, " $1");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      <header className="sticky top-0 z-20 backdrop-blur bg-neutral-950/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 grid place-items-center rounded-md bg-white text-neutral-900 font-semibold">VH</div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">VoxHire</span>
              <span className="text-xs text-neutral-400">Voice-first interview</span>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <button className="text-neutral-300 hover:text-white transition-colors">Privacy</button>
            <button className="text-neutral-300 hover:text-white transition-colors">Help</button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Start Your Interview</h1>
          <p className="text-lg text-neutral-400">Complete your details and select your role to begin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="rounded-xl border border-white/10 bg-white/5">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-xl font-semibold">Your Details</h2>
              <p className="text-sm text-neutral-400 mt-1">Tell us about yourself</p>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Profile Photo (Optional)</label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full border-2 border-white/10 bg-neutral-900/60 overflow-hidden flex items-center justify-center">
                    {userDetails.photo ? (
                      <img src={userDetails.photo} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-neutral-500" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} ref={fileInputRef} className="hidden" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-neutral-300 mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={userDetails.name}
                    onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full bg-neutral-900/60 border border-white/10 rounded-lg text-sm pl-10 pr-3 py-2.5 text-white placeholder:text-neutral-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-neutral-300 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="email"
                    value={userDetails.email}
                    onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-neutral-900/60 border border-white/10 rounded-lg text-sm pl-10 pr-3 py-2.5 text-white placeholder:text-neutral-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-xl font-semibold">Choose Role</h2>
              <p className="text-sm text-neutral-400 mt-1">Select the position you're applying for</p>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Job Role *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 z-10" />
                  <select
                    value={userDetails.role}
                    onChange={(e) => setUserDetails({ ...userDetails, role: e.target.value })}
                    className="w-full appearance-none bg-neutral-900/60 border border-white/10 rounded-lg text-sm pl-10 pr-10 py-2.5 text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    
                    <option value="datascience">Data Scientist</option>
                    <option value="HR(humain recourse) + Managerial">HR</option>
                    <option value="Data Analytics">Data Analytics</option>
                    <option value="product">Product Manager</option>
                    <option value="frontend">Front-End Developer</option>
                    <option value="devops">DevOps Engineer</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-neutral-900/40 p-4">
                <h3 className="text-sm font-semibold mb-2">{roleLabel}</h3>
                <p className="text-xs text-neutral-400">
                  You'll answer AI-generated questions tailored to your role through voice recordings.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
                <Shield className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-neutral-400">
                  Your responses are saved to the backend. Speech is transcribed and sent as text.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleStartInterview}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-indigo-500/30 bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            <span>Start Interview</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-white/10 text-sm text-neutral-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} VoxHire. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="hover:text-neutral-300 transition-colors">Terms</button>
            <button className="hover:text-neutral-300 transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const speakQuestion = (text: string, voices: SpeechSynthesisVoice[]) => {
  if (!text || voices.length === 0) return;
  const cleanedText = text
    .replace(/`/g, "")           // remove backticks
    .replace(/'/g, " apostrophe ") 
    .replace(/"/g, " quote ")
    .replace(/\*/g, " asterisk ")
    .replace(/_/g, " underscore ")
    .replace(/\(/g, " open bracket ")
    .replace(/\)/g, " close bracket ")
    .replace(/\{/g, " open curly brace ")
    .replace(/\}/g, " close curly brace ")
    .replace(/\[/g, " open square bracket ")
    .replace(/\]/g, " close square bracket ");
  const utter = new SpeechSynthesisUtterance(cleanedText);
  utter.lang = "en-US";

  const selectedVoice =
    voices.find((v) => v.name.includes("Google UK English Female")) ||
    voices.find((v) => v.lang === "en-US") ||
    voices[0];

  if (selectedVoice) utter.voice = selectedVoice;

  utter.rate = 1;
  utter.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
};

function InterviewPage({
  name,
  email,
  photo,
  role,
  sessionId,
  onBack,
  onFinishInterview
}: {
  name: string;
  email: string;
  photo: string | null;
  role: string;
  sessionId: string;
  onBack: () => void;
  onFinishInterview: (sessionId: string, violations: number) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isFirstQuestion, setIsFirstQuestion] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("Ready");
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [faceLandmarker, setFaceLandmarker] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string>('');
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const intervalIdRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lookAwayCountRef = useRef(0);
  const lastLookAwayTimeRef = useRef(0);
  const warningTimeoutRef = useRef<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, " $1");

  const showCustomAlert = (message: string) => {
    console.warn("Alert:", message);
    alert(message);
  };
  useEffect(() => {
  const loadVoices = () => {
    const availableVoices = window.speechSynthesis.getVoices();
    setVoices(availableVoices);
  };

  loadVoices();

  // Some browsers load voices asynchronously
  window.speechSynthesis.onvoiceschanged = loadVoices;
}, []);

useEffect(() => {
  if (currentQuestion) {
    speakQuestion(currentQuestion, voices);
  }
}, [currentQuestion, voices]);

  useEffect(() => {
    let mounted = true;
    const initializeFaceLandmarker = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
            
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        });

        if (mounted) {
          setFaceLandmarker(landmarker);
        }
      } catch (err) {
        console.error('Error initializing FaceLandmarker:', err);
        if (mounted) {
          setTrackingError('Failed to load face detection model');
        }
      }
    };

    initializeFaceLandmarker();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start camera for eye tracking
  const startEyeTracking = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
          setIsTrackingActive(true);
          detectFace();
        });
      }
    } catch (err) {
      setTrackingError('Failed to access camera for monitoring');
      console.error('Camera access error:', err);
    }
  };

  // Stop eye tracking
  const stopEyeTracking = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsTrackingActive(false);
  };

  // Detect face and monitor for suspicious activity
// Detect face and monitor for suspicious activity
const detectFace = async () => {
  if (!videoRef.current || !canvasRef.current || !faceLandmarker || !isTrackingActive) {
    animationFrameRef.current = requestAnimationFrame(detectFace);
    return;
  }

  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  if (!ctx || video.readyState !== 4) {
    animationFrameRef.current = requestAnimationFrame(detectFace);
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const startTimeMs = performance.now();
  const results = faceLandmarker.detectForVideo(video, startTimeMs);

  if (results.faceLandmarks && results.faceLandmarks.length > 0) {
    const landmarks = results.faceLandmarks[0];

    // Draw landmarks
    ctx.fillStyle = "rgba(0,255,0,0.8)";
    interface NormalizedLandmark {
      x: number;
      y: number;
      z: number;
      visibility?: number;
    }
    landmarks.forEach((p: NormalizedLandmark) => {
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Analyze gaze and head pose for suspicious activity
    analyzeFaceOrientation(landmarks);
  } else {
    // No face detected
    const currentTime = Date.now();
    if (currentTime - lastLookAwayTimeRef.current > 2000) { // More than 2 seconds
      lastLookAwayTimeRef.current = currentTime;
      lookAwayCountRef.current++;
      
      if (lookAwayCountRef.current > 2) {
        addSuspiciousActivity('face-not-detected', 'Face not visible in camera');
        displayWarning('⚠️ Please keep your face visible');
      }
    }
  }

  animationFrameRef.current = requestAnimationFrame(detectFace);
};

// Analyze face orientation to detect looking away
const analyzeFaceOrientation = (landmarks: any[]) => {
  try {
    // Get key facial landmarks
    const nose = landmarks[1]; // Nose tip
    const leftEye = landmarks[33]; // Left eye outer corner
    const rightEye = landmarks[263]; // Right eye outer corner
    const leftEar = landmarks[234]; // Left ear
    const rightEar = landmarks[454]; // Right ear

    // Calculate face center
    const faceCenter = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2
    };

    // Calculate horizontal deviation (left/right turn)
    const horizontalDeviation = Math.abs(nose.x - faceCenter.x);
    
    // Calculate vertical deviation (up/down tilt)
    const verticalDeviation = Math.abs(nose.y - faceCenter.y);

    // Check if eyes are looking away based on head pose
    const lookingAway = horizontalDeviation > 0.15 || verticalDeviation > 0.2;

    if (lookingAway) {
      const currentTime = Date.now();
      
      // Only trigger if looking away for more than 1.5 seconds
      if (currentTime - lastLookAwayTimeRef.current > 1500) {
        lastLookAwayTimeRef.current = currentTime;
        lookAwayCountRef.current++;
        
        if (lookAwayCountRef.current % 2 === 0) { // Alert every 2nd occurrence
          const direction = horizontalDeviation > 0.15 ? 
            (nose.x > faceCenter.x ? 'right' : 'left') : 
            (nose.y > faceCenter.y ? 'down' : 'up');
          
          addSuspiciousActivity('looking-away', `Looking ${direction} from screen`);
          displayWarning(`⚠️ Please look at the screen`);
        }
      }
    } else {
      // Reset timer when looking at screen
      lastLookAwayTimeRef.current = Date.now();
    }

    // Detect if face is too far to the side (profile view)
    const eyeDistance = Math.abs(leftEye.x - rightEye.x);
    if (eyeDistance < 0.15) { // Face turned too much to side
      addSuspiciousActivity('profile-detected', 'Face turned away from camera');
      displayWarning('⚠️ Please face the camera directly');
    }

  } catch (error) {
    console.error('Error analyzing face orientation:', error);
  }
};


  const addSuspiciousActivity = (type: string, description: string) => {
    setSuspiciousActivities(prev => [
      ...prev,
      { type, timestamp: Date.now(), description }
    ]);
  };

  const displayWarning = (message: string) => {
    setWarningMessage(message);
    setShowWarning(true);
    
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    warningTimeoutRef.current = window.setTimeout(() => {
      setShowWarning(false);
    }, 3000);
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      showCustomAlert("Speech recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }

      setTranscript((prev) => prev + finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setStatusText('No speech detected. Please try again.');
      } else {
        setStatusText(`Error: ${event.error}`);
      }
      stopRecording();
    };

    recognition.onend = () => {
      if (isRecording) {
        setIsRecording(false);
        setStatusText('Recording stopped');
      }
    };

    recognitionRef.current = recognition;
    getFirstQuestion();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      stopEyeTracking();
    };
  }, []);

  const getFirstQuestion = () => {
    setCurrentQuestion("Tell me about yourself.");
    setIsFirstQuestion(true);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      showCustomAlert("Speech recognition not available");
      return;
    }

    // Start eye tracking when recording starts
    if (!isTrackingActive && faceLandmarker) {
      startEyeTracking();
    }

    setTranscript("");
    setTotalSeconds(0);
    setIsRecording(true);
    setStatusText("Recording... Speak now");
    setSubmitted(false);
    
    try {
      recognitionRef.current.start();
      
      intervalIdRef.current = window.setInterval(() => {
        setTotalSeconds((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      showCustomAlert('Failed to start recording. Please try again.');
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    setIsRecording(false);
    setStatusText("Recording stopped");
  };

  const retake = () => {
    setTranscript("");
    setTotalSeconds(0);
    setStatusText("Ready to record");
    setSubmitted(false);
  };

  const submitAnswer = async () => {
    if (!transcript.trim()) {
      showCustomAlert("Please record an answer before submitting.");
      return;
    }

    setIsProcessing(true);
    setSubmitted(true);
    setStatusText("Submitting...");

    try {
      await fetch(`${API_BASE_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          answer: transcript,
          session_id: sessionId,
          name: name,
          email: email,
          role: role
        })
      });

      const newQuestionCount = questionCount + 1;
      setQuestionCount(newQuestionCount);

      if (newQuestionCount >= TOTAL_QUESTIONS) {
        setInterviewComplete(true);
        setStatusText("Interview complete!");
        setIsProcessing(false);
        stopEyeTracking(); // Stop tracking when interview completes
        return;
      }

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: transcript,
          domain: role 
        })
      });

      const data = await response.json();
      
      if (data.question.toLowerCase().includes("thank you") || 
          data.question.toLowerCase().includes("complete") ||
          data.question.toLowerCase().includes("finished")) {
        setInterviewComplete(true);
        setStatusText("Interview complete!");
        stopEyeTracking();
      } else {
        setCurrentQuestion(data.question);
        setTranscript("");
        setTotalSeconds(0);
        setSubmitted(false);
        setIsRecording(false);
        setStatusText("Ready to record");
        setIsFirstQuestion(false);
        
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (error) {
            // Ignore
          }
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      showCustomAlert('Failed to submit answer. Please try again.');
      setStatusText("Error submitting");
      setSubmitted(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      <header className="sticky top-0 z-20 backdrop-blur bg-neutral-950/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 grid place-items-center rounded-md bg-white text-neutral-900 font-semibold">VH</div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">VoxHire</span>
              <span className="text-xs text-neutral-400">Voice-first interview</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              {photo && <img src={photo} alt={name} className="h-8 w-8 rounded-full object-cover border border-white/10" />}
              <div className="text-right">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-neutral-400">{email}</p>
              </div>
            </div>
            <button onClick={onBack} className="text-sm text-neutral-300 hover:text-white transition-colors">Exit</button>
          </div>
        </div>
      </header>

      {/* Warning Banner */}
      {/* Warning Banner */}
      {showWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
          <div className="bg-yellow-400 border-2 border-yellow-500 text-neutral-900 px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 flex-shrink-0" />
            <span className="font-bold text-lg">{warningMessage}</span>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-indigo-600/20 border border-indigo-500/30 grid place-items-center">
                <Mic className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-300">{roleLabel}</p>
                <h2 className="text-lg font-semibold">AI Interview Session</h2>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <p className="text-sm text-neutral-400">{formatTime(totalSeconds)}</p>
                <p className="text-xs text-neutral-500">Session: {sessionId.slice(0, 8)}...</p>
              </div>
              {suspiciousActivities.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-semibold">{suspiciousActivities.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {isProcessing && !currentQuestion && !interviewComplete ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-400" />
            <p className="text-neutral-400">Preparing your interview...</p>
          </div>
        ) : (
          <>
            {!interviewComplete && (
              <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full text-xs border border-white/10 bg-white/5">
                      Question {questionCount + 1} / {TOTAL_QUESTIONS}
                    </span>
                    <span className="text-xs text-neutral-500">Voice answer</span>
                    {isTrackingActive && (
                      <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-green-500/20 border border-green-500/30 text-green-400">
                        <Eye className="h-3 w-3" />
                        Monitoring
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
  <h3 className="text-xl md:text-2xl font-semibold">{currentQuestion}</h3>

  {/* Speak Button */}
  <button
    onClick={() => speakQuestion(currentQuestion, voices)}
    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg
               bg-white/10 border border-white/20 hover:bg-white/20 transition"
  >
    <Headphones/>
    </button>
</div>

                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={startRecording}
                      disabled={isRecording || submitted || isProcessing}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-indigo-500/30 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Mic className="h-4 w-4" />
                      <span className="text-sm font-medium">Start Recording</span>
                    </button>
                    <button
                      onClick={stopRecording}
                      disabled={!isRecording}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <StopCircle className="h-4 w-4" />
                      <span className="text-sm">Stop</span>
                    </button>
                    <button
                      onClick={retake}
                      disabled={!transcript || isRecording || submitted}
                      className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="text-sm">Retake</span>
                    </button>
                  </div>

                  <div className="h-16 rounded-lg border border-white/10 bg-neutral-950/60 flex items-center px-3">
                    <div className="flex-1 flex items-end gap-1 h-12">
                      {[...Array(20)].map((_, i) => (
                        <span
                          key={i}
                          className={`w-1.5 rounded ${isRecording ? "bg-indigo-500/60 animate-pulse" : "bg-indigo-500/20"}`}
                          style={{ height: `${isRecording ? (10 + Math.random() * 80) : 10}%`, transition: 'height 0.2s', animationDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-400 ml-3">{statusText}</span>
                  </div>

                  {transcript && (
                    <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Headphones className="h-4 w-4 text-neutral-300" />
                          <span className="text-sm text-neutral-300">Transcription</span>
                        </div>
                        <span className="text-xs text-neutral-500">{transcript.trim().split(' ').length} words</span>
                      </div>
                      <div className="max-h-40 overflow-y-auto text-sm text-neutral-200 leading-relaxed">
                        {transcript}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={submitAnswer}
                      disabled={!transcript || submitted || isProcessing || isRecording}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {isProcessing ? "Processing..." : "Submit Answer"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {interviewComplete && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md bg-emerald-600/20 border border-emerald-500/30 grid place-items-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Interview Complete</h4>
                    <p className="text-sm text-neutral-400 mt-1">
                      Thank you, {name}! Your responses have been saved.
                    </p>
                    {suspiciousActivities.length > 0 && (
                      <p className="text-sm text-yellow-400 mt-2">
                        ⚠️ {suspiciousActivities.length} monitoring alert{suspiciousActivities.length > 1 ? 's' : ''} recorded during the interview.
                      </p>
                    )}
                    <button
                      onClick={() => onFinishInterview(sessionId, suspiciousActivities.length)}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-indigo-500/30 bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                    >
                      View Results
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Eye Tracking Monitor - Bottom Left */}
      {!interviewComplete && (
        <div className="fixed bottom-4 left-4 z-30">
  <div className="bg-neutral-900 border border-white/10 rounded-lg overflow-hidden shadow-xl" style={{ width: '280px' }}>
    <div className="bg-neutral-800 px-3 py-2 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4 text-neutral-400" />
        <span className="text-xs text-neutral-300 font-medium">Proctoring Monitor</span>
      </div>

      {isTrackingActive && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Active</span>
        </div>
      )}
    </div>

    {/* PROPER STRUCTURE */}
    <div className="relative bg-black" style={{ height: '180px' }}>
      {/* VIDEO BELOW */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* CANVAS ABOVE */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* TRACKING STATUS OVERLAY */}
      {isTrackingActive && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/80 rounded text-xs font-semibold text-white">
          Tracking Active
        </div>
      )}

      {/* SHOW MESSAGE ONLY IF NOT TRACKING */}
      {!isTrackingActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/80">
          <CameraOff className="h-8 w-8 text-neutral-500 mb-2" />
          <p className="text-xs text-neutral-400">Monitoring starts with recording</p>
        </div>
      )}
    </div>

    {trackingError && (
      <div className="px-3 py-2 bg-red-500/10 border-t border-red-500/20">
        <p className="text-xs text-red-400">{trackingError}</p>
      </div>
    )}

    {suspiciousActivities.length > 0 && (
      <div className="px-3 py-2 bg-yellow-500/10 border-t border-yellow-500/20">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-3 w-3 text-yellow-400" />
          <span className="text-xs text-yellow-400 font-medium">
            {suspiciousActivities.length} Alert{suspiciousActivities.length > 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-xs text-neutral-400">
          Last: {suspiciousActivities[suspiciousActivities.length - 1]?.type}
        </p>
      </div>
    )}
  </div>
</div>

      )}
    </div>
  );
}