import React, { useState } from "react";
import ReactQuill from "react-quill"; // Import react-quill
import "react-quill/dist/quill.snow.css"; // Import the styles for quill editor
import { Button } from "@/components/ui/button"; // You can customize the button or use your own
import { toast } from "sonner"; // Assuming you're using sonner for notifications

const RichTextEditor = ({ value, onChange }) => {
    const [editorValue, setEditorValue] = useState(value);

    // Define a custom image handler
    const imageHandler = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                // Upload the image to your server or cloud service (e.g., Cloudinary)
                // You can use FormData to send the file and get the image URL
                const formData = new FormData();
                formData.append("file", file);
                // Replace with your image upload API
                try {
                    const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    });

                    const data = await response.json();
                    const imageUrl = data?.url; // Assuming the response contains the image URL
                    if (imageUrl) {
                        const quill = window.quill;
                        const range = quill.getSelection();
                        quill.insertEmbed(range.index, "image", imageUrl); // Insert image at the cursor position
                        onChange(quill.root.innerHTML); // Update parent component with the HTML content
                    } else {
                        toast.error("Image upload failed");
                    }
                } catch (error) {
                    toast.error("Error uploading image");
                }
            }
        };
    };

    const modules = {
        toolbar: [
            [{ header: "1" }, { header: "2" }, { font: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["bold", "italic", "underline", "strike"],
            ["blockquote"],
            [{ align: [] }],
            ["link", "image"], // Add image option
            [{ color: [] }, { background: [] }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            ["clean"],
        ],
    };

    return (
        <div>
            <ReactQuill
                value={editorValue}
                onChange={(content) => {
                    setEditorValue(content);
                    onChange(content); // Update the parent with editor content
                }}
                modules={modules}
                formats={[
                    "header",
                    "font",
                    "list",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "blockquote",
                    "align",
                    "link",
                    "image",
                    "color",
                    "background",
                    "script",
                    "indent",
                ]}
            />
            <Button onClick={imageHandler} variant="outline">Insert Image</Button>
        </div>
    );
};

export default RichTextEditor;
