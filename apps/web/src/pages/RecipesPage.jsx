import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../lib/api";

function RecipesPage() {
    const [recipes, setRecipes] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [steps, setSteps] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [addingIngredients, setAddingIngredients] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingRecipeId, setEditingRecipeId] = useState(null);
    const detailSectionRef = useRef(null);
    const formSectionRef = useRef(null);
    const titleInputRef = useRef(null);

    async function loadRecipes() {
        try {
            setError("");
            setLoading(true);
            const data = await apiRequest("/recipes");
            setRecipes(data.recipes || []);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRecipes();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        const nextTitle = title.trim();
        const nextIngredients = ingredients.trim();
        const nextSteps = steps.trim();

        if (!nextTitle || !nextIngredients) {
            setError("Añade un nombre y al menos un ingrediente para guardar la receta.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");
            const isEditing = editingRecipeId !== null;
            await apiRequest(isEditing ? `/recipes/${editingRecipeId}` : "/recipes", {
                method: isEditing ? "PUT" : "POST",
                body: JSON.stringify({
                    title: nextTitle,
                    description: description.trim(),
                    ingredients: nextIngredients,
                    steps: nextSteps
                })
            });
            setTitle("");
            setDescription("");
            setIngredients("");
            setSteps("");
            setEditingRecipeId(null);
            await loadRecipes();
            setSuccess(isEditing ? "Receta actualizada correctamente." : "Receta guardada correctamente.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    }

    async function addIngredientsToList(recipe) {
        try {
            setAddingIngredients(true);
            setError("");
            setSuccess("");
            const ingredientList = (recipe.ingredients || []).map((ingredient) => ingredient.trim()).filter(Boolean);

            for (const ingredient of ingredientList) {
                await apiRequest("/list", {
                    method: "POST",
                    body: JSON.stringify({
                        name: ingredient,
                        quantity: 1,
                        source: "recipe",
                        recipeGroup: recipe.title
                    })
                });
            }

            window.dispatchEvent(new CustomEvent("cesta:list-updated"));
            setSuccess(`Ingredientes de ${recipe.title} añadidos a la lista como grupo.`);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setAddingIngredients(false);
        }
    }

    function openRecipe(recipeId) {
        setSelectedRecipeId(recipeId);
    }

    function startEditingRecipe(recipe) {
        setTitle(recipe.title);
        setDescription(recipe.description || "");
        setIngredients((recipe.ingredients || []).join("\n"));
        setSteps((recipe.steps || []).join("\n"));
        setEditingRecipeId(recipe.id);
        setShowCreateForm(true);
    }

    function closeRecipeForm() {
        setShowCreateForm(false);
        setEditingRecipeId(null);
        setTitle("");
        setDescription("");
        setIngredients("");
        setSteps("");
    }

    function startCreatingRecipe() {
        setTitle("");
        setDescription("");
        setIngredients("");
        setSteps("");
        setEditingRecipeId(null);
        setShowCreateForm(true);
    }

    async function deleteRecipe(recipe) {
        const confirmed = window.confirm(`¿Seguro que quieres eliminar la receta "${recipe.title}"?`);

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");
            await apiRequest(`/recipes/${recipe.id}`, { method: "DELETE" });
            setSelectedRecipeId(null);
            await loadRecipes();
            setSuccess("Receta eliminada correctamente.");
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    const selectedRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId) || null;

    useEffect(() => {
        if (selectedRecipe && detailSectionRef.current) {
            detailSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [selectedRecipe]);

    useEffect(() => {
        if (showCreateForm && formSectionRef.current) {
            formSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            titleInputRef.current?.focus({ preventScroll: true });
        }
    }, [showCreateForm, editingRecipeId]);

    return (
        <section className="recipes-page">
            <section className="panel panel--hero">
                <div>
                    <p className="eyebrow">Recetas</p>
                    <h2>Consulta tus platos favoritos y añade nuevos</h2>
                    <p>
                        Guarda recetas sencillas para repetir en casa y ten siempre una referencia rápida al cocinar.
                    </p>
                </div>
                <div className="summary-chip">
                    <strong>{recipes.length}</strong>
                    <span>recetas</span>
                </div>
            </section>

            {showCreateForm ? (
                <section ref={formSectionRef} className="panel panel--stacked">
                    <div className="section-header">
                        <div>
                            <h3>{editingRecipeId !== null ? "Editar receta" : "Añadir receta"}</h3>
                            <p className="section-subtitle">
                                {editingRecipeId !== null
                                    ? "Modifica los datos de la receta publicada"
                                    : "Crea una nueva receta con ingredientes y descripción"}
                            </p>
                        </div>
                        <button type="button" className="secondary-button" onClick={closeRecipeForm}>
                            Cerrar
                        </button>
                    </div>

                    <form className="recipe-form" onSubmit={handleSubmit}>
                        <input
                            ref={titleInputRef}
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="Nombre de la receta"
                        />
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Descripción breve del plato"
                        />
                        <textarea
                            value={ingredients}
                            onChange={(event) => setIngredients(event.target.value)}
                            placeholder="Ingredientes (separados por comas o saltos de línea)"
                        />
                        <textarea
                            value={steps}
                            onChange={(event) => setSteps(event.target.value)}
                            placeholder="Pasos para preparar la receta (uno por línea)"
                        />
                        <button type="submit" disabled={saving}>
                            {saving ? "Guardando..." : editingRecipeId !== null ? "Actualizar receta" : "Guardar receta"}
                        </button>
                    </form>

                    {error && <p className="error-text">{error}</p>}
                    {success && <p className="success-text">{success}</p>}
                </section>
            ) : null}

            <section className="panel">
                <div className="section-header">
                    <div>
                        <h3>Recetas disponibles</h3>
                        <p className="section-subtitle">Tu colección de platos favoritos</p>
                    </div>
                    <div className="basket-actions">
                        <span className="count-pill">{recipes.length}</span>
                        <button type="button" className="secondary-button" onClick={startCreatingRecipe}>
                            Añadir receta
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="empty-state">Cargando recetas...</p>
                ) : recipes.length ? (
                    <div className="recipe-grid">
                        {recipes.map((recipe) => (
                            <article id={`recipe-card-${recipe.id}`} key={recipe.id} className="recipe-card">
                                <div className="recipe-card__top">
                                    <strong>{recipe.title}</strong>
                                    <span className="recipe-pill">Receta</span>
                                </div>
                                {recipe.description ? (
                                    <p className="recipe-description">{recipe.description}</p>
                                ) : null}
                                <div className="recipe-ingredients">
                                    {(recipe.ingredients || []).map((ingredient) => (
                                        <span className="recipe-tag" key={`${recipe.id}-${ingredient}`}>
                                            {ingredient}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn--secondary"
                                    onClick={() => openRecipe(recipe.id)}
                                >
                                    Ver receta
                                </button>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="empty-state">Todavía no hay recetas guardadas. Añade la primera.</p>
                )}
            </section>

            {selectedRecipe ? (
                <section ref={detailSectionRef} className="panel panel--stacked">
                    <div className="section-header">
                        <div>
                            <h3>{selectedRecipe.title}</h3>
                            <p className="section-subtitle">Detalles de la receta</p>
                        </div>
                        <button type="button" className="secondary-button" onClick={() => setSelectedRecipeId(null)}>
                            Cerrar
                        </button>
                    </div>

                    {selectedRecipe.description ? (
                        <p className="recipe-description">{selectedRecipe.description}</p>
                    ) : null}

                    <div>
                        <h4>Ingredientes</h4>
                        <div className="recipe-ingredients">
                            {(selectedRecipe.ingredients || []).map((ingredient) => (
                                <span className="recipe-tag" key={`${selectedRecipe.id}-${ingredient}`}>
                                    {ingredient}
                                </span>
                            ))}
                        </div>
                    </div>

                    {selectedRecipe.steps?.length ? (
                        <div>
                            <h4>Pasos</h4>
                            <ol className="recipe-steps">
                                {selectedRecipe.steps.map((step, index) => (
                                    <li key={`${selectedRecipe.id}-step-${index}`}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    ) : null}

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => startEditingRecipe(selectedRecipe)}
                    >
                        Editar receta
                    </button>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => addIngredientsToList(selectedRecipe)}
                        disabled={addingIngredients}
                    >
                        {addingIngredients ? "Añadiendo..." : "Añadir ingredientes a la lista"}
                    </button>
                    <button
                        type="button"
                        className="secondary-button secondary-button--danger"
                        onClick={() => deleteRecipe(selectedRecipe)}
                    >
                        Eliminar receta
                    </button>
                </section>
            ) : null}
        </section>
    );
}

export default RecipesPage;
