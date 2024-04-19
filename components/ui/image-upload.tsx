"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

import { Button } from "@/components/ui/button";

interface ImageUpload {
    disabled?: boolean,
    onChange: (value: string) => void,
    onRemove: (value: string) => void,
    value: string[]
}

const ImageUpload = ({
    disabled,
    onChange,
    onRemove,
    value
}: ImageUpload) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const onUpload = (result: any) => {
        onChange(result.info.secure_url);
    }

    if(!mounted) return null;

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value.map(url => (
                    <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
                        <div className="z-10 absolute top-2 right-2">
                            <Button 
                                type="button" 
                                variant="destructive"
                                size="icon"
                                onClick={() => onRemove(url)}
                            >
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>
                        <Image 
                            fill
                            className="object-cover"
                            src={url}
                            alt="uploaded image"
                        />
                    </div>
                ))}
            </div>
            <CldUploadWidget onUpload={onUpload} uploadPreset="vqgdjprh">
                {({ open }) => {
                    return (
                        <Button 
                            type="button"
                            onClick={() => open()}
                            disabled={disabled}
                            variant="secondary"
                        >
                            <ImagePlus className="w-4 h-4 mr-2" />
                            Upload image
                        </Button>
                    );
                }}
            </CldUploadWidget>
        </div>
    )
}

export default ImageUpload;