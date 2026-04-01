import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, categoriesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProductsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    minThreshold: "",
    categoryId: "",
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getAll().then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product created successfully" });
      setCreateOpen(false);
      resetForm();
    },
    onError: (err: any) =>
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to create",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product updated" });
      setEditProduct(null);
      resetForm();
    },
    onError: (err: any) =>
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to update",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted" });
    },
    onError: (err: any) =>
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to delete",
      }),
  });

  const resetForm = () =>
    setForm({
      name: "",
      price: "",
      stock: "",
      minThreshold: "",
      categoryId: "",
    });

  const handleCreate = () => {
    createMutation.mutate({
      name: form.name,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      minThreshold: parseInt(form.minThreshold),
      categoryId: form.categoryId,
    });
  };

  const handleEdit = (p: any) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      minThreshold: String(p.minThreshold),
      categoryId: p.categoryId || "",
    });
  };

  const handleUpdate = () => {
    if (!editProduct) return;
    updateMutation.mutate({
      id: editProduct.id,
      data: {
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        minThreshold: parseInt(form.minThreshold),
        categoryId: form.categoryId,
      },
    });
  };

  const catList = Array.isArray(categories) ? categories : [];
  const filtered = (Array.isArray(products) ? products : []).filter(
    (p: any) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const ProductForm = ({
    initialForm,
    onSubmit,
    loading,
    editProduct,
  }: {
    initialForm: any;
    onSubmit: (form: any) => void;
    loading: boolean;
    editProduct: boolean;
  }) => {
    const [form, setForm] = useState(initialForm);

    // Update form when initialForm changes (for editing)
    useEffect(() => {
      setForm(initialForm);
    }, [initialForm]);

    const handleSubmit = () => {
      onSubmit(form);
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Product Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Product name"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label>Stock</Label>
            <Input
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: e.target.value }))
              }
              placeholder="0"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Min Threshold</Label>
            <Input
              type="number"
              value={form.minThreshold}
              onChange={(e) =>
                setForm((f) => ({ ...f, minThreshold: e.target.value }))
              }
              placeholder="10"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {catList.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.price}
          >
            {loading ? "Saving..." : editProduct ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory products
          </p>
        </div>
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={handleCreate}
              loading={createMutation.isPending}
              initialForm={form}
              editProduct={true}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !filtered.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-10 w-10 mb-2" />
              <p>No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{Number(p.price).toFixed(2)}৳</TableCell>
                    <TableCell>
                      <span
                        className={
                          p.stock <= (p.minThreshold || 0)
                            ? "text-destructive font-semibold"
                            : ""
                        }
                      >
                        {p.stock}
                      </span>
                    </TableCell>
                    <TableCell>{p.category?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "ACTIVE" ? "default" : "destructive"
                        }
                        className={
                          p.status === "ACTIVE"
                            ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                            : ""
                        }
                      >
                        {p.status || "ACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog
                          open={editProduct?.id === p.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditProduct(null);
                              resetForm();
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(p)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                            </DialogHeader>
                            <ProductForm
                              onSubmit={handleUpdate}
                              loading={updateMutation.isPending}
                              initialForm={form}
                              editProduct={true}
                            />
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Product
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{p.name}"? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(p.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;
