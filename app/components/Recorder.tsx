"use client"

import Image from "next/image";
import activeAssistantIcon from "../img/active.gif";
import notActiveAssistantIcon from "../img/non-active.png";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

export const mimeType = "audio/webm";

export default function Recorder({ uploadAudio }: { uploadAudio: (blob: Blob) => void }) {
    // Pending status becomes true when the form is submitting so long as this component is a child element of the form 
    const { pending } = useFormStatus();

    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    useEffect(() => {
        getMicrophonePermission()
    }, []);

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                });
                setPermission(true);
                setStream(streamData)
            } catch (err: unknown) {
                alert((err as Error).message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.")
        }
    }

    const startRecording = async () => {
        if (stream === null || pending || mediaRecorder === null) return;

        setRecordingStatus("recording");

        // Create a new media recorder instance using the stream (where we get permissions)
        const media = new MediaRecorder(stream, { mimeType });
        mediaRecorder.current = media
        mediaRecorder.current.start();

        // CHANGE TO LET ************************************
        const localAudioChunks: Blob[] = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;

            localAudioChunks.push(event.data);
        }

        setAudioChunks(localAudioChunks);
    }

    const stopRecording = async () => {
        if (mediaRecorder.current === null || pending) return;

        setRecordingStatus("inactive");
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            uploadAudio(audioBlob);
            setAudioChunks([]);
        }
    }

    return (
        <div className="flex items-center justify-center text-white">

            {!permission && (
                <button onClick={getMicrophonePermission}>Get Microphone</button>
            )}

            {pending && (
                <Image
                    src={activeAssistantIcon}
                    width={250}
                    height={250}
                    priority
                    alt="Recording"
                    className="assistant grayscale"
                />
            )}

            {permission && recordingStatus === "inactive" && !pending && (
                <Image
                    src={notActiveAssistantIcon}
                    width={250}
                    height={250}
                    priority={true}
                    onClick={startRecording}
                    alt="Not Recording"
                    className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
                />
            )}

            {recordingStatus === "recording" && (
                <Image
                    src={activeAssistantIcon}
                    width={250}
                    height={250}
                    priority={true}
                    onClick={stopRecording}
                    alt="Recording"
                    className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
                />
            )}


        </div>
    )
}
