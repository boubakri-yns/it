<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $images = [
            'DIVA' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
            'DIAVOLA 2.0' => 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=1200&q=80',
            "PUMP'N SPIN" => 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=1200&q=80',
            'DEAR MARGHERITA' => 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1200&q=80',
            'PARMA PAZZA' => 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1200&q=80',
            'LA RUSTICA' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80',
            'BOLO ROSSO' => 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80',
            'BOLO BIANCO' => 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1200&q=80',
            'RED KISS' => 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=1200&q=80',
            'ALLA VALENTINA' => 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
            'PISTACCHIO' => 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1200&q=80',
            'GARFIELD' => 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80',
            'PERFETTO' => 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80',
            'KISS MY MOUSSE' => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
            'PISTACHIC' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80',
            'CLASSICO TIRAMISU' => 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=1200&q=80',
            'TIRAMISU DE PIETRO' => 'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=1200&q=80',
            'GOLDEN BREAD' => 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?auto=format&fit=crop&w=1200&q=80',
            'TRIO INFERNO' => 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&w=1200&q=80',
            'FINGER MOOD' => 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
        ];

        $catalog = [
            'Pizza' => [
                ['DIVA', 13.00, 'Une version moderne et gourmande de la Margherita, avec des bords genereusement garnis de ricotta cremeuse'],
                ['DIAVOLA 2.0', 15.00, 'Sauce tomate, mozzarella fior di latte, oignons rouges, spianata, olives et ndjua'],
                ["PUMP'N SPIN", 15.00, 'Creme de potiron, mozzarella fior di latte, scamorza, ndjua et pousses d epinards'],
                ['DEAR MARGHERITA', 12.00, 'Sauce tomate, mozzarella fior di latte, basilic et huile d olive EVO'],
                ['PARMA PAZZA', 19.00, 'Sauce tomate, mozzarella fior di latte, burratina, jambon cru de Parme 18 mois d affinage, roquette, copeaux de Grana Padano et basilic'],
                ['LA RUSTICA', 15.00, 'Mozzarella fior di latte, pommes de terre, cacio cavallo et salsiccia'],
            ],
            'Pasta' => [
                ['BOLO ROSSO', 14.00, 'Des tagliatelle nappees d une sauce bolognaise a la sauce tomate, riche en saveurs et pleine de douceur'],
                ['BOLO BIANCO', 15.00, 'Des tagliatelle nappees d une sauce bolognaise, sans tomate, riche en saveurs et pleine de douceur'],
                ['RED KISS', 14.00, 'Gnocchi moelleux et genereux, servi avec une sauce tomate parfumee, fondue a la mozzarella et gratine au parmesan'],
                ['ALLA VALENTINA', 24.00, 'Spaghetti alla chitarra al tartufo, prepares dans une meule de Pecorino DOP et truffe fraiche'],
                ['PISTACCHIO', 17.00, 'Mezze maniche au pesto de pistaches, stracciatella et pistaches croquantes'],
                ['GARFIELD', 16.00, 'Lasagnes revisitees facon carbo : guanciale croustillant, creme onctueuse, scamorza fumee et parmesan'],
            ],
            'Dolce Vita' => [
                ['PERFETTO', 10.00, 'Un dessert glace aux amandes, accompagne d un coulis de chocolat fondant'],
                ['KISS MY MOUSSE', 9.00, 'Une mousse au chocolat legere et gourmande, servie avec du crumble chocolat'],
                ['PISTACHIC', 9.00, 'Crumble a la ricotta sucree, creme de pistache et eclats de pistaches croquantes'],
                ['CLASSICO TIRAMISU', 9.00, 'L eternel tiramisu fatto con amore par La Squadra Gruppomimo'],
                ['TIRAMISU DE PIETRO', 9.00, 'Le tiramisu de Pietro, rempli d amour et de pistaches'],
            ],
            'Antipasti' => [
                ['GOLDEN BREAD', 7.00, 'Pizzetta doree au four, stracciatella fumee, tomates cerises, olives taggiasche, estragon et zeste de citron vert'],
                ['TRIO INFERNO', 14.00, '3 arancine : al tartufo, bolognese, cacio e pepe, sauce tomate et sauce Mimo'],
                ['FINGER MOOD', 10.00, 'Scamorza fumee panee et doree, croustillante a l exterieur, fondante a l interieur, servie avec une sauce tomate epicee maison'],
            ],
        ];

        foreach ($catalog as $categoryName => $products) {
            $category = Category::query()->where('name', $categoryName)->firstOrFail();

            foreach ($products as $index => [$name, $price, $description]) {
                Product::updateOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'category_id' => $category->id,
                        'name' => $name,
                        'description' => $description,
                        'price' => $price,
                        'image' => $images[$name] ?? 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
                        'is_available' => true,
                        'is_featured' => $index < 2,
                        'preparation_time' => 15 + $index,
                    ]
                );
            }
        }
    }
}
