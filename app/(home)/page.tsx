"use client";

import { Mic, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

import { PlayCircle, StopCircle } from "lucide-react";

const text = "Many Languages - ONE India";

export default function BhashaGPT() {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { question: string; answer: string }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isgptTyping, setgptIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<any>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "hi-IN";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        stopRecording();
      };
    }
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
      clearInterval(timerRef.current);
      if (input.trim()) {
        sendMessage();
      }
    }
  };

  const toggleSpeech = (text: string, index: number) => {
    if ("speechSynthesis" in window) {
      if (speakingIndex === index) {
        speechSynthesis.cancel();
        setSpeakingIndex(null);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "hi-IN";
        utterance.rate = 1;

        utterance.onend = () => setSpeakingIndex(null);

        speechSynthesis.speak(utterance);
        setSpeakingIndex(index);
      }
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const simulateTyping = (message: string, index: number) => {
    return new Promise((resolve) => {
      let words = message.split(" ");
      let typedMessage = "";
      setIsTyping(true);

      let i = 0;
      const interval = setInterval(() => {
        if (i < words.length) {
          typedMessage += words[i] + " ";
          setChatHistory((prev) =>
            prev.map((chat, idx) =>
              idx === index ? { ...chat, answer: typedMessage } : chat
            )
          );
          i++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          resolve(true);
        }
      }, 100);
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);
    setChatHistory((prev) => [
      ...prev,
      { question: userMessage, answer: "Bhashagpt is Typing ..." },
    ]);

    setgptIsTyping(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      });
      setgptIsTyping(false);

      const data = await response.json();
      const botResponse = data.response["content"];

      await simulateTyping(botResponse, chatHistory.length);
    } catch (error) {
      setChatHistory((prev) =>
        prev.map((chat, index) =>
          index === prev.length - 1
            ? { ...chat, answer: "Error fetching response. Please try again!" }
            : chat
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="h-screen flex flex-col justify-between bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <div className=" w-full py-4 px-5 text-center">
        <h1 className="text-5xl font-bold text-black">BhashaGPT</h1>
        <motion.h4 className="text-xl text-black font-bold">{text}</motion.h4>
      </div>

      <div
        ref={chatContainerRef}
        className="w-full flex flex-col items-center space-y-4 px-4 max-h-[60vh] overflow-y-auto"
      >
        {chatHistory.length === 0 ? (
          <img
            src="/images/video.gif"
            alt="Chat Placeholder"
            className="w-100 h-100 object-contain"
          />
        ) : (
          chatHistory.map((chat, index) => (
            <div key={index} className="w-full flex flex-col">
              <motion.div
                className="bg-[#053e99] text-white px-4 py-2 rounded-lg shadow-md self-end max-w-[75%] text-left"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ borderRadius: "15px 15px 0 15px" }}
              >
                {chat.question}
              </motion.div>

              <div className="flex items-center gap-1">
                <motion.div
                  className="bg-white text-black px-4 py-2 rounded-lg shadow-md self-start max-w-[75%] text-left mt-2"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ borderRadius: "15px 15px 15px 0" }}
                >
                  {chat.answer.split("\n").map((paragraph, idx) => (
                    <p key={idx} className="mb-2">
                      {paragraph}
                    </p>
                  ))}
                </motion.div>

                {isgptTyping ? (
                  <div></div>
                ) : (
                  <button
                    onClick={() => toggleSpeech(chat.answer, index)}
                    className="ml-3 p-2 rounded-full bg-black hover:bg-black-300 text-white flex items-center gap-1"
                  >
                    {speakingIndex === index ? (
                      <StopCircle size={20} />
                    ) : (
                      <PlayCircle size={20} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="w-full flex justify-center pb-5">
        <div className="flex items-center bg-white text-black rounded-full px-4 py-2 shadow-lg w-120">
          <button
            className={`p-2 rounded-full ${
              isRecording ? "bg-red-500" : "bg-black"
            }`}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
          >
            <Mic className="text-white" />
          </button>
          {isRecording && (
            <span className="ml-2">{`Start Speaking: ${elapsedTime}s`}</span>
          )}
          <input
            type="text"
            placeholder="Type your question..."
            className="flex-grow outline-none px-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className={`p-2 rounded-full ${
              input.trim() ? "bg-[#053e99]" : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
          >
            <Send className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
