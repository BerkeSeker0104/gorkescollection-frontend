    'use client';

    import { useEffect, useState } from "react";
    import { Category, AdminCategoryDto } from "@/types";
    import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api"; 
    import { Edit, Trash2, PlusCircle } from "lucide-react";
    import { useForm } from "react-hook-form";

    export default function AdminCategoriesPage() {
        const [categories, setCategories] = useState<Category[]>([]);
        const [loading, setLoading] = useState(true);
        const [editingCategory, setEditingCategory] = useState<Category | null>(null);
        
        const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<AdminCategoryDto>();

        const fetchCategories = async () => {
            setLoading(true);
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories);
            setLoading(false);
        };

        useEffect(() => {
            fetchCategories();
        }, []);
        
        const handleDelete = async (categoryId: number) => {
            if (window.confirm("Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategoriye ait ürünler varsa sorun oluşabilir.")) {
                const success = await deleteCategory(categoryId);
                if (success) {
                    fetchCategories(); // Listeyi yenile
                } else {
                    alert("Kategori silinirken bir hata oluştu.");
                }
            }
        };

        const handleEdit = (category: Category) => {
            setEditingCategory(category);
            setValue("name", category.name);
            setValue("slug", category.slug);
        };

        const handleCancelEdit = () => {
            setEditingCategory(null);
            reset({ name: "", slug: "" });
        };

        const onSubmit = async (data: AdminCategoryDto) => {
            let success = false;
            if (editingCategory) {
                success = await updateCategory(editingCategory.id, data);
            } else {
                const newCategory = await createCategory(data);
                success = newCategory !== null;
            }

            if (success) {
                fetchCategories();
                handleCancelEdit();
            } else {
                alert("İşlem sırasında bir hata oluştu.");
            }
        };

        if (loading) return <p>Kategoriler yükleniyor...</p>;

        return (
            <div className="container mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Kategori Yönetimi</h1>
                
                {/* Ekleme/Düzenleme Formu */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-lg font-semibold mb-4">{editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name">Kategori Adı</label>
                                <input {...register("name")} className="mt-1 w-full p-2 border rounded-md"/>
                                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="slug">URL (slug)</label>
                                <input {...register("slug")} className="mt-1 w-full p-2 border rounded-md"/>
                                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" disabled={isSubmitting} className="bg-gray-800 text-white px-4 py-2 rounded-md">
                                {isSubmitting ? "Kaydediliyor..." : (editingCategory ? "Güncelle" : "Ekle")}
                            </button>
                            {editingCategory && (
                                <button type="button" onClick={handleCancelEdit} className="bg-gray-200 px-4 py-2 rounded-md">
                                    İptal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Kategori Listesi */}
                <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4">ID</th>
                                <th className="p-4">Kategori Adı</th>
                                <th className="p-4">URL (slug)</th>
                                <th className="p-4">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{category.id}</td>
                                    <td className="p-4 font-medium">{category.name}</td>
                                    <td className="p-4">{category.slug}</td>
                                    <td className="p-4">
                                        <div className="flex gap-4">
                                            <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800"><Edit size={18}/></button>
                                            <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
    