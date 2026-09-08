const categoryToSubcategories = {
    Outerwear: [
        "Blazers", "Cardigans", "Coats", "Fur Coats", "Hoodies",
        "Jackets", "Kimonos", "Denim Jackets", "Leather Jackets", "Trench Coats", "Parkas"
    ],
    Dresses: [
        "Day Dress", "Formal Dress", "Maxi Dress", "Party Dress", "Pinafore", "T Shirt Dress"
    ],
    Skirts: ["Mini Skirt", "Midi Skirt", "Maxi Skirt"],
    Shoes: ["Boots", "Heels", "Trainers", "Sandals"],
    Tights: ["Fishnets", "Mesh Leggings", "Tights", "Stockings"],
    Tops: ["Bralette", "Cami", "Fancy", "Tank Tops", "T Shirts", "Long Sleeve", "Mesh"],
    Trousers: ["Jeans", "Shorts", "Leggings", "Trousers"],
    Other: ["Bags", "Hats", "Jammies", "Scarves", "Swimwear"],
    Makeup: ["Eyeshadow", "Lipstick"]
};

const categorySelect = document.getElementById('category');
const subcategorySelect = document.getElementById('subcategory');

function getWardrobeAdminKey() {
    let key = localStorage.getItem("wardrobeAdminKey");

    if (!key) {
        key = prompt("Wardrobe admin key:");

        if (key) {
            localStorage.setItem("wardrobeAdminKey", key);
        }
    }

    return key;
}

categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    const options = categoryToSubcategories[selectedCategory] || [];

    subcategorySelect.innerHTML = '<option value="">-- Select --</option>';
    subcategorySelect.disabled = true;

    if (options.length > 0) {
        options.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            subcategorySelect.appendChild(opt);
        });

        subcategorySelect.disabled = false;
    }
});

document.getElementById('wardrobeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting…';

    try {
        const file = formData.get('photo');

        const cloudForm = new FormData();
        cloudForm.append('file', file);
        cloudForm.append('upload_preset', 'Wardrobe');

        const cloudinaryRes = await fetch(
            'https://api.cloudinary.com/v1_1/dxehyqwbc/image/upload',
            {
                method: 'POST',
                body: cloudForm
            }
        );

        if (!cloudinaryRes.ok) {
            const errorText = await cloudinaryRes.text();
            throw new Error(errorText);
        }

        const cloudinaryData = await cloudinaryRes.json();

        const colours = [
            ...form.querySelectorAll('input[name="colour"]:checked')
        ].map(cb => cb.value);

        const score = form.querySelector('input[name="score"]:checked')?.value;

        const wardrobeRes = await fetch(
            "https://silent-tree-4c97.rebecca-mulholland.workers.dev/items",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Wardrobe-Key": getWardrobeAdminKey()
                },
                body: JSON.stringify({
                    name: formData.get("name"),
                    subcategory: formData.get("subcategory"),
                    brand: formData.get("brand"),
                    score: score ? parseInt(score) : null,
                    fav: formData.get("fav") === "true",
                    colour: colours,
                    pattern: formData.get("pattern"),
                    style: formData.get("style"),
                    zone: formData.get("zone"),
                    category: formData.get("category"),
                    photo: cloudinaryData.secure_url
                })
            }
        );

        if (wardrobeRes.status === 401) {
            localStorage.removeItem("wardrobeAdminKey");
            throw new Error("Incorrect wardrobe admin key.");
        }

        if (!wardrobeRes.ok) {
            const errorText = await wardrobeRes.text();
            throw new Error(errorText);
        }

        alert('Wardrobe item submitted!');
        form.reset();

    } catch (error) {
        alert('Something went wrong. Please try again.');
        console.error(error);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
});