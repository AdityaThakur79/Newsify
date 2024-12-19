import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
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
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCreateCourseMutation } from '@/features/api/courseApi';
import { useGetAllCategoriesQuery } from '@/features/api/categoryApi';
import { useGetAllTagsQuery } from '@/features/api/tagApi';
import { toast } from 'sonner';
import RichTextEditor from '@/components/RichTextEditor';

const AddCourse = () => {
    const [articleTitle, setArticleTitle] = useState('');
    const [subTitle, setSubTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [readingTime, setReadingTime] = useState('');
    const [publishedAt, setPublishedAt] = useState('');

    const navigate = useNavigate();
    const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
    const { data: tagsData, isLoading: tagsLoading } = useGetAllTagsQuery();
    const [createCourse, { data, isLoading, error, isSuccess }] = useCreateCourseMutation();

    const createCourseHandler = async () => {
        await createCourse({
            articleTitle,
            subTitle,
            description,
            category,
            tags,
            publishedAt,
            readingTime,
        });
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Course Created Successfully");
            navigate("/admin/course");
        } else if (error) {
            toast.error(error?.data?.message || "Course creation failed");
        }
    }, [isSuccess, error, data, navigate]);

    return (
        <div className="flex-1 mx-10">
            <div className="mb-4">
                <h1 className="font-bold text-xl">Add a New Article</h1>
                <p className="text-sm">Provide the required details to create a new article.</p>
            </div>
            <div className="space-y-4">
                <div>
                    <Label>Title</Label>
                    <Input
                        type="text"
                        value={articleTitle}
                        onChange={(e) => setArticleTitle(e.target.value)}
                        placeholder="Article Title"
                    />
                </div>
                <div>
                    <Label>Subtitle</Label>
                    <Input
                        type="text"
                        value={subTitle}
                        onChange={(e) => setSubTitle(e.target.value)}
                        placeholder="Article Subtitle"
                    />
                </div>
                <div>
                    <Label>Description</Label>
                    <RichTextEditor
                        value={description}
                        onChange={setDescription}
                    />
                </div>
                <div>
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Category</SelectLabel>
                                {categoriesLoading ? (
                                    <SelectItem value="loading">Loading...</SelectItem>
                                ) : (
                                    categoriesData?.categories?.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Tags</Label>
                    <Select
                        multiple
                        value={tags}
                        onValueChange={setTags}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select tags" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Tags</SelectLabel>
                                {tagsLoading ? (
                                    <SelectItem value="loading">Loading...</SelectItem>
                                ) : (
                                    tagsData?.tags?.map((tag) => (
                                        <SelectItem key={tag._id} value={tag._id}>
                                            {tag.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Reading Time (in minutes)</Label>
                    <Input
                        type="number"
                        value={readingTime}
                        onChange={(e) => setReadingTime(e.target.value)}
                        placeholder="Estimated Reading Time"
                    />
                </div>
                <div>
                    <Label>Published At</Label>
                    <Input
                        type="date"
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate("/admin/course")}>Back</Button>
                    <Button disabled={isLoading} onClick={createCourseHandler}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please Wait
                            </>
                        ) : (
                            "Create"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddCourse;
