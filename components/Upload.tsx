"use client"
import axios from 'axios'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'

export default function Upload() {
    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState<UploadState>("idle")
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const fileRef = useRef<HTMLInputElement | null>(null)

    type UploadState = "idle" | "uploading" | "success" | "error"

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        if(e.target.files){
            console.log("before: ",file)
            setFile(e.target.files[0])
            console.log("after: ",file)
        }
    }

    const handleUpload = async() => {
        if(!file) {
            console.log("no file")
            return
        }

        setStatus("uploading")
        setUploadProgress(0)
        
        const formData = new FormData()
        formData.append("file", file)
        
        try {
            await axios.post("https://httpbin.org/post", formData, {
                headers: {
                    "Content-Type" : "multipart/form-data"
                },
                onUploadProgress(progressEvent) {
                    const progress = progressEvent.total ? Math.round((progressEvent.loaded/progressEvent.total) * 100) : 0
                    setUploadProgress(progress)
                },
            })
            setStatus("success")
            
        } catch (error: any) {
            console.error("Frontend upload error: ", error.message)
            setUploadProgress(0)
            setStatus("error")
        }
    }

    useEffect(() => {
        if(status === "success" || status === "error"){
            setTimeout(() => {
                setStatus("idle")
                setFile(null)
                if(fileRef.current) fileRef.current.value = ""
            }, 5000)
        }
    }, [status])
  return (
    <div className='space-x-4 space-y-4'>
        <input ref={fileRef} type="file" name="" id="" className='border rounded-lg p-3 cursor-pointer' onChange={handleFile}/>

        {
            status === "uploading" && (
                <div className="space-y-2">
                    <div className='my-2 w-full rounded-md block overflow-clip'>
                        <div className='h-2.5 bg-green-500 ease-in-out duration-700' style={{width: `${uploadProgress}%`}}/>
                    </div>

                    <p className='font-semibold text-gray-600'>{uploadProgress}% uploaded</p>
                </div>
            )
        }

        { status !== 'uploading' &&
            <button className='px-8 py-3 cursor-pointer capitalize hover:opacity-50' onClick={handleUpload}>upload</button>
        }
        
        {status === "success" && <p className='font-semibold text-green-500 capitalize'>file uploaded successfully!</p>}
        {status === "error" && <p className='font-semibold text-red-500 capitalize'>file upload failed</p>}
        
    </div>
  )
}

