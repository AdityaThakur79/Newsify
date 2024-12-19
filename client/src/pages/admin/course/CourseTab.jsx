import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '@/components/RichTextEditor.jsx';
import { Loader2 } from 'lucide-react';
import { useGetCourseByIdQuery, usePublishCourseMutation, useUpdateCourseMutation } from '@/features/api/courseApi';
import { useGetAllCategoriesQuery, } from '@/features/api/categoryApi'; // Import the category API query
import { useGetAllTagsQuery, } from '@/features/api/tagApi'; // Import the tag API query
import { toast } from 'sonner';

const CourseTab = () => {

    const params = useParams();
    const courseId = params.courseId;

    const navigate = useNavigate();
    const [publishCourse, { data: publishCourseData }] = usePublishCourseMutation();

    const [input, setInput] = useState({
        articleTitle: "",
        subTitle: "",
        description: "",
        category: "",
        tags: "",
        isPublished: false,
        publishedAt: "",
        readingTime: "",
        courseThumbnail: "",
    });

    const [previewThumbnail, setPreviewThumbnail] = useState("");
    const [updateCourse, { data, isLoading, isSuccess, error }] = useUpdateCourseMutation();
    const { data: courseByIdData, isLoading: courseByIdLoading } = useGetCourseByIdQuery(courseId);

    // Fetch categories and tags
    const { data: categoriesData } = useGetAllCategoriesQuery();
    const { data: tagsData } = useGetAllTagsQuery();

    // Publish Course Handler
    const publishCourseHanlder = async (e) => {
        try {
            const response = await publishCourse({ courseId, query: e });
            if (response.data) {
                toast.success(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to Change the Status of Article");
        }
    };

    // Fetching Course Information By Id
    useEffect(() => {
        if (courseByIdData?.article) {
            const course = courseByIdData.article;

            setInput({
                articleTitle: course.articleTitle,
                subTitle: course.subTitle,
                category: course.category.name,
                tags: course.tags.name || "",
                isPublished: course.isPublished,
                publishedAt: course.publishedAt || "",
                readingTime: course.readingTime || "",
                courseThumbnail: course.articleThumbnail || "",
            });
            setPreviewThumbnail(course.articleThumbnail);
            toast.success("Article Details Fetched");
        }
    }, [courseByIdData]);

    // On change handler
    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    };

    // Capturing selected courseCategory
    const selectCategory = (value) => {
        setInput({ ...input, category: value });
    };

    // Capturing selected tags (assuming tags are a string)
    const changeTags = (e) => {
        setInput({ ...input, tags: e.target.value });
    };

    // Capturing thumbnail
    const selectThumbnail = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, courseThumbnail: file });
            const fileReader = new FileReader();
            fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
            fileReader.readAsDataURL(file);
        }
    };

    // Handling Update request
    const updateCourseHandler = async () => {
        const formData = new FormData();
        formData.append("articleTitle", input.articleTitle);
        formData.append("subTitle", input.subTitle);
        formData.append("description", input.description);
        formData.append("category", input.category);
        formData.append("tags", input.tags);
        formData.append("isPublished", input.isPublished);
        formData.append("publishedAt", input.isPublished ? new Date() : input.publishedAt); // Set publishedAt if published
        formData.append("readingTime", input.readingTime);
        formData.append("courseThumbnail", input.courseThumbnail);

        await updateCourse({ formData, courseId });
    };

    // Update Handler Toast
    useEffect(() => {
        if (isSuccess) {
            toast.success(data.message || "Article updated successfully.");
        }
        if (error) {
            toast.error(error.data.message || "Failed to update Article");
        }
    }, [isSuccess, error]);

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between">
                <div>
                    <CardTitle>Basic Article Information</CardTitle>
                    <CardDescription>
                        Make changes to your Article here. Click save when you're done.
                    </CardDescription>
                </div>
                <div className="space-x-2">
                    <Button variant="outline" onClick={() => { publishCourseHanlder(input.isPublished ? "false" : "true") }}>
                        {input.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button>Delete Course</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mt-5">
                    <div>
                        <Label>Title</Label>
                        <Input
                            type="text"
                            name="articleTitle"
                            value={input.articleTitle}
                            onChange={changeEventHandler}
                            placeholder="Ex. Fullstack Developer"
                        />
                    </div>
                    <div>
                        <Label>Subtitle</Label>
                        <Input
                            type="text"
                            name="subTitle"
                            value={input.subTitle}
                            onChange={changeEventHandler}
                            placeholder="Ex. Become a Fullstack developer from zero to hero in 2 months"
                        />
                    </div>

                    <div className="flex items-center gap-5">
                        <div>
                            <Label>Category</Label>
                            <Select
                                value={input.category}
                                onValueChange={selectCategory}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Category</SelectLabel>
                                        {categoriesData?.categories?.map((category) => (
                                            <SelectItem key={category._id} value={category._id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Tags</Label>
                            <Select
                                onValueChange={(value) => setInput({ ...input, tags: value })}
                                value={input.tags}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select tags" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Tags</SelectLabel>
                                        {tagsData?.tags?.map((tag) => (
                                            <SelectItem key={tag._id} value={tag._id}>
                                                {tag.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                    <div>
                        <Label>Course Thumbnail</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            className="w-fit"
                            onChange={selectThumbnail}
                        />
                        {
                            previewThumbnail && (
                                <img src={previewThumbnail} className='w-64 my-2' alt='courseThumbnail' />
                            )
                        }
                    </div>
                    <div>
                        <Button onClick={() => navigate("/admin/course")} variant="outline">
                            Cancel
                        </Button>
                        <Button disabled={isLoading} onClick={updateCourseHandler}>
                            {isLoading ? (<><Loader2 className='animate-spin mr-2 h-4 w-4' />Please Wait</>) : "Save"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CourseTab;
