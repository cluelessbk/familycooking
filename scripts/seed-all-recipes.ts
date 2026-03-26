/**
 * Seeds all parsed recipes into the database.
 * Creates the "Хляб" category if it doesn't exist.
 * Usage: npx tsx scripts/seed-all-recipes.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

interface IngredientInput {
  name: string;
  quantity: number | null;
  unit: string | null;
}

interface StepInput {
  stepNumber: number;
  instruction: string;
}

interface RecipeInput {
  title: string;
  description: string;
  category: string;
  servings: number | null;
  prepTime: number | null;
  cookTime: number | null;
  ingredients: IngredientInput[];
  steps: StepInput[];
}

const recipes: RecipeInput[] = [
  // ==========================================
  // 1. Печени зеленчуци с наденички
  // ==========================================
  {
    title: "Печени зеленчуци с наденички",
    description: "Печени зеленчуци с наденички на фурна — лесно и сочно ястие с минимална подготовка.",
    category: "Основни ястия",
    servings: null,
    prepTime: 15,
    cookTime: 60,
    ingredients: [
      { name: "картофи", quantity: null, unit: null },
      { name: "моркови", quantity: null, unit: null },
      { name: "лук", quantity: null, unit: null },
      { name: "наденички", quantity: null, unit: null },
      { name: "кимион", quantity: null, unit: "малко" },
      { name: "дафинов лист", quantity: 1, unit: "бр" },
      { name: "риган", quantity: null, unit: null },
      { name: "сол", quantity: null, unit: null },
      { name: "черен пипер", quantity: null, unit: null },
      { name: "мазнина", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "Зеленчуците се нарязват на големи парчета (моркови — дълги парчета, лук — четвъртинки) и се слагат в тавата." },
      { stepNumber: 2, instruction: "Добавя се мазнината и подправките и се объркват." },
      { stepNumber: 3, instruction: "Наденичките се нарязват и се нареждат в тавата." },
      { stepNumber: 4, instruction: "Добавя се вода (поне един пръст) и се слага във фурната на 200 градуса под фолио." },
      { stepNumber: 5, instruction: "След около час се отваря фолиото, за да се запече. Може да се пусне и вентилатор." },
    ],
  },

  // ==========================================
  // 2. Ориз с пиле, мед и фурми
  // ==========================================
  {
    title: "Ориз с пиле, мед и фурми",
    description: "Chicken and rice with honey and dates — a one-pot dish with warm spices, served with fresh herbs.",
    category: "Основни ястия",
    servings: null,
    prepTime: null,
    cookTime: 30,
    ingredients: [
      { name: "olive oil", quantity: null, unit: null },
      { name: "free-range chicken legs (може и с гърди)", quantity: 2, unit: "бр" },
      { name: "free-range chicken thighs", quantity: 2, unit: "бр" },
      { name: "onion", quantity: 1, unit: "бр" },
      { name: "garlic", quantity: 1, unit: "clove" },
      { name: "ground coriander", quantity: 2, unit: "teaspoons" },
      { name: "ground cumin", quantity: 1, unit: "heaped teaspoon" },
      { name: "long-grain rice", quantity: 250, unit: "g" },
      { name: "Medjool dates", quantity: 150, unit: "g" },
      { name: "runny honey", quantity: 1, unit: "tablespoon" },
      { name: "fresh coriander или магданоз", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "Heat a splash of oil in a pan and brown the chicken legs and thighs all over, then remove to a plate." },
      { stepNumber: 2, instruction: "Peel and dice the onion, then in the same pan sweat the onion until softened, before crushing in the garlic and adding the spices." },
      { stepNumber: 3, instruction: "Allow to cook for about 2 minutes, then stir in the rice, dates, honey and browned chicken." },
      { stepNumber: 4, instruction: "Cover with water and bring to the boil before allowing to simmer, covered, over a medium heat for 30 minutes, or until the rice and chicken are cooked through." },
      { stepNumber: 5, instruction: "Season to taste with sea salt and black pepper, then pick, roughly chop and scatter over the coriander leaves, to serve." },
    ],
  },

  // ==========================================
  // 3. Гювеч, постен (нормално количество)
  // ==========================================
  {
    title: "Гювеч, постен (нормално количество)",
    description: "Постен гювеч със зеленчуци — лесно ястие, което се реже и пече в тава.",
    category: "Основни ястия",
    servings: null,
    prepTime: null,
    cookTime: null,
    ingredients: [
      { name: "картофи", quantity: 3, unit: "бр" },
      { name: "зелен фасул", quantity: null, unit: "шепа и половина" },
      { name: "грах", quantity: null, unit: "шепа и половина" },
      { name: "червена чушка", quantity: 1, unit: "бр" },
      { name: "домат (настърган)", quantity: 1, unit: "бр" },
      { name: "моркови", quantity: 2, unit: "бр" },
      { name: "праз", quantity: 1, unit: "стрък" },
      { name: "чубрица", quantity: null, unit: null },
      { name: "червен пипер", quantity: null, unit: null },
      { name: "черен пипер", quantity: null, unit: null },
      { name: "коприва на прах (ако има)", quantity: null, unit: null },
      { name: "сол", quantity: null, unit: null },
      { name: "олио", quantity: null, unit: null },
      { name: "вода", quantity: 1, unit: "малка чаша" },
    ],
    steps: [
      { stepNumber: 1, instruction: "Всички зеленчуци се нарязват и се изсипват в тава." },
      { stepNumber: 2, instruction: "Добавят се подправките, олиото и водата." },
      { stepNumber: 3, instruction: "Пече се във фурната." },
    ],
  },

  // ==========================================
  // 4. Зелеви сарми с месо
  // ==========================================
  {
    title: "Зелеви сарми с месо",
    description: "Класически зелеви сарми с месо и ориз — готвят се бавно в тенджера или фурна.",
    category: "Основни ястия",
    servings: null,
    prepTime: null,
    cookTime: 150,
    ingredients: [
      { name: "кайма (или накълцано месо)", quantity: 1, unit: "кг" },
      { name: "ориз (измит)", quantity: 1, unit: "малка купичка" },
      { name: "зелева чорба", quantity: null, unit: null },
      { name: "черен пипер", quantity: null, unit: null },
      { name: "червен пипер", quantity: null, unit: null },
      { name: "зелеви листа", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "В каймата се слага малка купичка измит ориз, малко зелева чорба (за овкусяване), черен и червен пипер." },
      { stepNumber: 2, instruction: "Сместа се оставя 10 минути да поседи и да се овкуси." },
      { stepNumber: 3, instruction: "Завиват се сармите в зелеви листа." },
      { stepNumber: 4, instruction: "Между сармите се слагат зелеви листа и малко червен пипер." },
      { stepNumber: 5, instruction: "Вариант 1 (тенджера): Слага се тежест (чиния) върху сармите, заливат се с зелева чорба и вода (да са покрити) и се готвят на бавен огън." },
      { stepNumber: 6, instruction: "Вариант 2 (фурна): Слагат се в гювеч и се пекат 2,5 часа." },
    ],
  },

  // ==========================================
  // 5. Пилешко в Air Fryer (Недовършена)
  // ==========================================
  {
    title: "Пилешко в Air Fryer (Недовършена)",
    description: "Пилешки гърди с ароматна марината, панирани с галета и печени в Air Fryer.",
    category: "Основни ястия",
    servings: 4,
    prepTime: 10,
    cookTime: null,
    ingredients: [
      { name: "пилешки гърди", quantity: 4, unit: "бр" },
      { name: "чесън (смачкан)", quantity: 1, unit: "скилидка" },
      { name: "сол", quantity: 1, unit: "лъжичка" },
      { name: "черен пипер", quantity: null, unit: null },
      { name: "лимон", quantity: 0.5, unit: "бр" },
      { name: "розмарин", quantity: null, unit: null },
      { name: "мащерка", quantity: null, unit: "малко" },
      { name: "сладка горчица (ако не е сладка — 1 л. горчица + 1 л. мед)", quantity: 2, unit: "с.л." },
      { name: "соев сос", quantity: 2, unit: "с.л." },
      { name: "кетчуп", quantity: 1, unit: "с.л." },
      { name: "галета", quantity: 2, unit: "с.л." },
      { name: "зехтин", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "Смесват се всички съставки за маринатата (чесън, сол, черен пипер, лимон, розмарин, мащерка, горчица, соев сос, кетчуп)." },
      { stepNumber: 2, instruction: "Гърдите се овалват в маринатата." },
      { stepNumber: 3, instruction: "Поръсват се с около две лъжици галета." },
      { stepNumber: 4, instruction: "Намазват се със зехтин с четка или се напръскват." },
      { stepNumber: 5, instruction: "Пекат се в Air Fryer (липсва температура и време)." },
    ],
  },

  // ==========================================
  // 6. Спаначена супа
  // ==========================================
  {
    title: "Спаначена супа",
    description: "Спаначена супа със зеленчуци, гъби и подправки — сервира се с лъжица заквасена сметана.",
    category: "Супи",
    servings: null,
    prepTime: null,
    cookTime: null,
    ingredients: [
      { name: "лук", quantity: null, unit: null },
      { name: "моркови", quantity: null, unit: null },
      { name: "гъби (печурки)", quantity: null, unit: null },
      { name: "сол", quantity: null, unit: null },
      { name: "мазнинка", quantity: null, unit: null },
      { name: "домати", quantity: null, unit: null },
      { name: "чесън", quantity: null, unit: null },
      { name: "къри", quantity: null, unit: null },
      { name: "спанак", quantity: null, unit: null },
      { name: "джоджен", quantity: null, unit: null },
      { name: "мента", quantity: null, unit: null },
      { name: "фиде", quantity: 1, unit: "врътка" },
      { name: "копър", quantity: null, unit: null },
      { name: "заквасена сметана (за сервиране)", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "Сварява се лук, моркови, гъби (печурки), нарязани на ситно, със сол и мазнинка." },
      { stepNumber: 2, instruction: "Като се сварят, слагаме ситно нарязани домати, чесън, къри, спанак, джоджен, мента." },
      { stepNumber: 3, instruction: "Като се посварят (смени се цветът на спанака), слагаме 1 врътка фиде, смачква се вътре, доовкусява се." },
      { stepNumber: 4, instruction: "Като се свари всичко, се маха от котлона и се слага копър." },
      { stepNumber: 5, instruction: "Сервира се с по 1 лъжица заквасена сметана в купичката." },
    ],
  },

  // ==========================================
  // 7. Пилешка супа
  // ==========================================
  {
    title: "Пилешка супа",
    description: "Класическа пилешка супа с бульон, зеленчуци и застройка.",
    category: "Супи",
    servings: null,
    prepTime: null,
    cookTime: 60,
    ingredients: [
      { name: "картофи (или фиде, или ориз)", quantity: null, unit: null },
      { name: "моркови", quantity: null, unit: null },
      { name: "лук", quantity: null, unit: null },
      { name: "пилешко месо", quantity: null, unit: null },
      { name: "магданоз", quantity: null, unit: null },
      { name: "чубрица", quantity: null, unit: null },
      { name: "джоджен", quantity: null, unit: null },
      { name: "девисил", quantity: null, unit: null },
      { name: "сол", quantity: null, unit: null },
      { name: "черен пипер", quantity: null, unit: null },
      { name: "фиде (за накрая)", quantity: null, unit: null },
      { name: "яйца (за застройка)", quantity: 2, unit: "бр" },
      { name: "кисело мляко (за застройка)", quantity: 1, unit: "кофичка (200-300 г)" },
      { name: "оцет или лимонов сок (по желание, за застройка)", quantity: 1, unit: "с.л." },
    ],
    steps: [
      { stepNumber: 1, instruction: "Слага се пилешко месо да заври. В зависимост от месото, ври 30-40 мин до 1 час." },
      { stepNumber: 2, instruction: "Като е готово, бульонът се прецежда в друга тенджера с нарязаните зеленчуци." },
      { stepNumber: 3, instruction: "Зеленчуците се варят, докато започнат да омекват." },
      { stepNumber: 4, instruction: "Добавя се месото при тях и врат заедно." },
      { stepNumber: 5, instruction: "Накрая се добавя фидетo и подправките за 8-10 мин." },
      { stepNumber: 6, instruction: "Маха се от котлона и се слага магданозът." },
      { stepNumber: 7, instruction: "Застройка: Разбийте яйцата с киселото мляко. По желание добавете 1 с.л. оцет или лимонов сок за гладкост." },
      { stepNumber: 8, instruction: "Темперирайте: Добавете черпак по черпак от топлата супа към сместа при непрекъснато бъркане, докато сместа се затопли." },
      { stepNumber: 9, instruction: "Изсипете застройката на тънка струя обратно в супата при постоянно бъркане. Важно: Супата не трябва да ври силно, за да не се пресече." },
    ],
  },

  // ==========================================
  // 8. Пил. Супа Руми
  // ==========================================
  {
    title: "Пил. Супа Руми",
    description: "Домашна пилешка супа с бутчета, зеленчуци и ориз — рецепта на Руми. Може да се сервира със застройка (виж Пилешка супа).",
    category: "Супи",
    servings: null,
    prepTime: 10,
    cookTime: 60,
    ingredients: [
      { name: "пилешки бутчета", quantity: null, unit: null },
      { name: "моркови", quantity: 2, unit: "бр" },
      { name: "картофи", quantity: 3, unit: "бр" },
      { name: "лук", quantity: 1, unit: "глава" },
      { name: "чушка (ако има)", quantity: null, unit: null },
      { name: "целина", quantity: null, unit: null },
      { name: "ориз (или фиде)", quantity: 4, unit: "с.л." },
      { name: "сол", quantity: null, unit: null },
      { name: "черен пипер", quantity: null, unit: null },
      { name: "магданоз", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "Варят се бутчетата (30-40 мин) с половин тенджера вода." },
      { stepNumber: 2, instruction: "Вадят се бутчетата и се сваля месото от костите." },
      { stepNumber: 3, instruction: "Кокалите се връщат във водата." },
      { stepNumber: 4, instruction: "Добавят се нарязаните зеленчуци и останалата вода (да останат ~3 пръста)." },
      { stepNumber: 5, instruction: "Слага се сол и черен пипер." },
      { stepNumber: 6, instruction: "Като тръгнат да омекват зеленчуците, слага се оризът." },
      { stepNumber: 7, instruction: "Като е почти готов оризът, махат се кокалите и се връща месото (нарязано)." },
      { stepNumber: 8, instruction: "Изчаква се да заври пак и се изключва." },
      { stepNumber: 9, instruction: "Добавя се магданозът." },
    ],
  },

  // ==========================================
  // 9. Леща
  // ==========================================
  {
    title: "Леща",
    description: "Гъста лещена супа с много зеленчуци и подправки.",
    category: "Супи",
    servings: null,
    prepTime: 60,
    cookTime: 30,
    ingredients: [
      { name: "леща", quantity: 500, unit: "г" },
      { name: "моркови", quantity: 2, unit: "бр" },
      { name: "чушка", quantity: 1, unit: "бр" },
      { name: "лук (по-големичка)", quantity: 1, unit: "глава" },
      { name: "чесън", quantity: 10, unit: "скилидки" },
      { name: "червен пипер", quantity: 1, unit: "ч.л." },
      { name: "чубрица", quantity: 1, unit: "ч.л." },
      { name: "куркума", quantity: 0.5, unit: "ч.л." },
      { name: "мащерка", quantity: 1, unit: "ч.л." },
      { name: "риган", quantity: 0.67, unit: "ч.л." },
      { name: "зехтин", quantity: null, unit: null },
      { name: "сол", quantity: null, unit: null },
      { name: "черен пипер", quantity: null, unit: "щипка-две" },
      { name: "магданоз (по желание)", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "Лещата се накисва 30-60 мин поне, после се измива." },
      { stepNumber: 2, instruction: "Слага се в тенджера с вода да я покрие и се слага да ври с капак." },
      { stepNumber: 3, instruction: "Като заври, се излива водата, изплаква се и се слага пак да ври." },
      { stepNumber: 4, instruction: "Слага се зехтин и сол." },
      { stepNumber: 5, instruction: "Зеленчуците се нарязват на малки кубчета." },
      { stepNumber: 6, instruction: "Като заври лещата, се слагат зеленчуците и подправките." },
      { stepNumber: 7, instruction: "Оставя се да ври 20-30 мин, докато омекнат зеленчуците и стане супата. Ако стане много гъсто, може да се добави вода." },
      { stepNumber: 8, instruction: "Накрая може да се сложи магданоз." },
    ],
  },

  // ==========================================
  // 10. Сладки с мас (Недовършена)
  // ==========================================
  {
    title: "Сладки с мас (Недовършена)",
    description: "Домашни сладки с мас. (Липсват стъпки за приготвяне.)",
    category: "Десерти",
    servings: null,
    prepTime: null,
    cookTime: null,
    ingredients: [
      { name: "захар", quantity: 1, unit: "ч.ч." },
      { name: "яйца + 1 за намазване", quantity: 2, unit: "бр" },
      { name: "мас", quantity: 2, unit: "с.л. (пълни)" },
      { name: "кисело мляко", quantity: 1, unit: "ч.ч." },
      { name: "сода бикарбонат", quantity: 1, unit: "ч.л." },
      { name: "брашно (колкото поеме за меко тесто)", quantity: null, unit: null },
      { name: "ванилия", quantity: 1, unit: "пакетче" },
      { name: "настъргана кора от лимон", quantity: 1, unit: "бр" },
    ],
    steps: [],
  },

  // ==========================================
  // 11. Мраморен кекс
  // ==========================================
  {
    title: "Мраморен кекс",
    description: "Класически мраморен кекс — лесен за приготвяне, с красива спирала от какао.",
    category: "Десерти",
    servings: null,
    prepTime: 15,
    cookTime: 35,
    ingredients: [
      { name: "яйца (или 4)", quantity: 2, unit: "бр" },
      { name: "захар", quantity: 1, unit: "ч.ч." },
      { name: "кисело мляко", quantity: 1, unit: "ч.ч." },
      { name: "олио", quantity: 0.5, unit: "ч.ч." },
      { name: "брашно", quantity: 2, unit: "ч.ч." },
      { name: "сода", quantity: 2, unit: "ч.л." },
      { name: "ванилии", quantity: 2, unit: "бр" },
      { name: "какао", quantity: 1, unit: "с.л." },
    ],
    steps: [
      { stepNumber: 1, instruction: "Разбиваме яйцата и захарта." },
      { stepNumber: 2, instruction: "Добавяме киселото мляко с добавената в него сода и отново разбиваме (целта е да се разтвори захарта)." },
      { stepNumber: 3, instruction: "Добавяме олиото, разбъркваме." },
      { stepNumber: 4, instruction: "Следват брашното и ванилията — от тук нататък се БЪРКА до хомогенност умерено с лъжица, за да не стане пластмасов кексът." },
      { stepNumber: 5, instruction: "В тавичка с намаслена със зехтин или масло хартия изсипваме 4/5 от сместа." },
      { stepNumber: 6, instruction: "В останалата смес слагаме какаото и разбъркваме добре. Сипваме го около средата и с нож или дървен шиш обръщаме сместа, за да стане на спирала." },
      { stepNumber: 7, instruction: "Печем на 200 градуса за около 30-40 минути." },
    ],
  },

  // ==========================================
  // 12. Меденка питка (Мързеливка баничка)
  // ==========================================
  {
    title: "Меденка питка (Мързеливка баничка)",
    description: "Лесна солена питка (мързеливка баничка) със сирене, кашкавал и пармезан.",
    category: "Закуски",
    servings: null,
    prepTime: 10,
    cookTime: 35,
    ingredients: [
      { name: "яйца (или 4)", quantity: 2, unit: "бр" },
      { name: "кисело мляко", quantity: 1, unit: "ч.ч." },
      { name: "олио/зехтин", quantity: 0.5, unit: "ч.ч." },
      { name: "брашно", quantity: 2, unit: "ч.ч." },
      { name: "сода", quantity: 2, unit: "ч.л." },
      { name: "сол", quantity: null, unit: "щипка" },
      { name: "подправки", quantity: null, unit: "1-2 щипки" },
      { name: "сирене", quantity: null, unit: null },
      { name: "кашкавал", quantity: null, unit: null },
      { name: "пармезан", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "Разбиваме яйцата и олиото." },
      { stepNumber: 2, instruction: "Добавяме киселото мляко с добавената в него сода и отново разбиваме." },
      { stepNumber: 3, instruction: "Следва брашното — от тук нататък се БЪРКА до хомогенност умерено с лъжица." },
      { stepNumber: 4, instruction: "След като брашното се поеме, добавяме нарязаното сирене, настъргания кашкавал и пармезана. Оставяме от сиренето и кашкавала за поръсване отгоре." },
      { stepNumber: 5, instruction: "В тавичка с намаслена със зехтин или масло хартия изсипваме сместа." },
      { stepNumber: 6, instruction: "Поръсваме със сиренето и кашкавала." },
      { stepNumber: 7, instruction: "Печем на 200 градуса за около 30-40 минути." },
    ],
  },

  // ==========================================
  // 13. Тиквеник (Недовършена)
  // ==========================================
  {
    title: "Тиквеник (Недовършена)",
    description: "Тиквеник с кори — класически десерт с пълнеж от задушена тиква, захар, канела и орехи. (Липсват количества за кори и масло.)",
    category: "Десерти",
    servings: null,
    prepTime: null,
    cookTime: null,
    ingredients: [
      { name: "тиква", quantity: 1, unit: "бр" },
      { name: "захар", quantity: 1, unit: "ч.ч." },
      { name: "канела", quantity: 1, unit: "пакетче (или 2/3 п.)" },
      { name: "орехи (смляни)", quantity: null, unit: null },
      { name: "кори", quantity: null, unit: null },
      { name: "масло", quantity: null, unit: null },
      { name: "олио", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "Тиквата се задушава в олио и масло." },
      { stepNumber: 2, instruction: "Като е готова, се маха от котлона и се добавят захарта, канелата и орехите. Разбърква се." },
      { stepNumber: 3, instruction: "Вадят се корите, мажат се с разтопено масло." },
      { stepNumber: 4, instruction: "Намазват се с пълнежа и се завиват." },
      { stepNumber: 5, instruction: "Като се завият всички и се наредят в тавата, се намазват с разтопено масло." },
      { stepNumber: 6, instruction: "Пече се във фурната (липсва температура и време)." },
    ],
  },

  // ==========================================
  // 14. Сладкиш "Блонди"
  // ==========================================
  {
    title: "Сладкиш \"Блонди\"",
    description: "Блонди с бял шоколад, фъстъчено масло и сладко от касис — богат десерт, чудесен с чаша чай.",
    category: "Десерти",
    servings: null,
    prepTime: 15,
    cookTime: 30,
    ingredients: [
      { name: "меко масло + допълнително за намазване", quantity: 200, unit: "г" },
      { name: "нерафинирана фина захар", quantity: 200, unit: "г" },
      { name: "големи яйца", quantity: 4, unit: "бр" },
      { name: "брашно с набухвател", quantity: 200, unit: "г" },
      { name: "бял шоколад", quantity: 200, unit: "г" },
      { name: "хрупкаво фъстъчено масло", quantity: 3, unit: "с.л." },
      { name: "сладко от касис", quantity: 3, unit: "с.л." },
    ],
    steps: [
      { stepNumber: 1, instruction: "Загрейте фурната на 180°С." },
      { stepNumber: 2, instruction: "Застелете тава (20 см × 30 см) с хартия за печене и намажете обилно с масло." },
      { stepNumber: 3, instruction: "В кухненски робот разбийте маслото и захарта." },
      { stepNumber: 4, instruction: "Добавете яйцата и брашното и разбийте до гладка смес." },
      { stepNumber: 5, instruction: "Добавете натрошения шоколад и натискайте пулсовия бутон, докато шоколадът стане на малки парченца." },
      { stepNumber: 6, instruction: "С шпатула прехвърлете сместа в тавата и заравнете." },
      { stepNumber: 7, instruction: "Разредете фъстъченото масло с 2 с.л. топла вода. Разбъркайте сладкото." },
      { stepNumber: 8, instruction: "Сипете фъстъченото масло и сладкото върху сместа и оформете шарки с клечка за зъби." },
      { stepNumber: 9, instruction: "Печете 30 минути или до златисто." },
      { stepNumber: 10, instruction: "Оставете сладкиша да изстине, след което нарежете и поднесете." },
    ],
  },

  // ==========================================
  // 15. Чийзкейк
  // ==========================================
  {
    title: "Чийзкейк",
    description: "Чийзкейк с крема сирене и малини върху бисквитена основа — печен, с леко препечени ръбчета.",
    category: "Десерти",
    servings: null,
    prepTime: 20,
    cookTime: 35,
    ingredients: [
      { name: "масло", quantity: 100, unit: "г" },
      { name: "бисквити (карамелени или джинджифилови с ядки)", quantity: 250, unit: "г" },
      { name: "пудра захар + допълнително за поръсване", quantity: 100, unit: "г" },
      { name: "крема сирене", quantity: 680, unit: "г" },
      { name: "малини", quantity: 300, unit: "г" },
      { name: "ванилова паста", quantity: 1, unit: "ч.л." },
      { name: "лимон", quantity: 1, unit: "бр" },
      { name: "големи яйца", quantity: 4, unit: "бр" },
    ],
    steps: [
      { stepNumber: 1, instruction: "Загрейте фурната на 160°С." },
      { stepNumber: 2, instruction: "Разтопете маслото в тиган за фурна (28 см) на слаб огън." },
      { stepNumber: 3, instruction: "Смелете бисквитите на фини трохи в кухненски робот." },
      { stepNumber: 4, instruction: "Изключете котлона, добавете трохите в тигана и разбъркайте." },
      { stepNumber: 5, instruction: "Разпределете сместа на равномерен слой и притиснете, като направите нисък борд по стените." },
      { stepNumber: 6, instruction: "Печете 5 минути, извадете от фурната." },
      { stepNumber: 7, instruction: "В кухненския робот разбийте яйцата с ванилията и по-голямата част от захарта за 2 мин, докато побелеят." },
      { stepNumber: 8, instruction: "Добавете крема сиренето и лимоновия сок, разбийте и разпределете върху основата." },
      { stepNumber: 9, instruction: "Намачкайте половината малини с останалата пудра захар, изсипете върху тестото и направете шарки с вилица." },
      { stepNumber: 10, instruction: "Печете 15 минути." },
      { stepNumber: 11, instruction: "Извадете, сложете останалите малини отгоре, поръсете с пудра захар и върнете за още 10 минути." },
      { stepNumber: 12, instruction: "Прехвърлете на най-високото ниво, включете горния реотан на най-висока степен и печете, докато повърхността стане златиста." },
      { stepNumber: 13, instruction: "Оставете да изстине, после сложете за 2 часа в хладилника преди поднасяне." },
    ],
  },

  // ==========================================
  // 16. Зеле с картофи
  // ==========================================
  {
    title: "Зеле с картофи",
    description: "Индийско зеле с картофи и подправки — сервира се с ориз.",
    category: "Основни ястия",
    servings: null,
    prepTime: null,
    cookTime: null,
    ingredients: [
      { name: "картофи", quantity: null, unit: null },
      { name: "зеле", quantity: null, unit: null },
      { name: "мазнина", quantity: null, unit: null },
      { name: "куркума", quantity: null, unit: null },
      { name: "кимион (смлян)", quantity: null, unit: null },
      { name: "червен пипер", quantity: null, unit: null },
      { name: "черен пипер", quantity: null, unit: null },
      { name: "кориандър", quantity: null, unit: null },
      { name: "канела", quantity: null, unit: "на върха на ножа" },
      { name: "сол", quantity: null, unit: null },
      { name: "домати", quantity: null, unit: null },
      { name: "препечен кимион", quantity: null, unit: null },
      { name: "ориз (за сервиране)", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "Картофите се изпържват на лунички и се отделят." },
      { stepNumber: 2, instruction: "В тенджерата се загрява мазнина и се слагат куркума, смлян кимион, червен пипер, черен пипер, кориандър, канела (на върха на ножа) и сол." },
      { stepNumber: 3, instruction: "Слага се нарязаното зеле да се оцвети, връща се на котлона и се разбърква да мине през горещото." },
      { stepNumber: 4, instruction: "Добавя се малко вода да не загаря, на тих огън се оставя да къкри." },
      { stepNumber: 5, instruction: "При последното разбъркване се добавя препечен кимион." },
      { stepNumber: 6, instruction: "Нареждат се нарязани домати и картофите, захлупва се." },
      { stepNumber: 7, instruction: "Като се отпуснат доматите, поръсва се с препечен кимион и се сервира с ориз." },
    ],
  },

  // ==========================================
  // 17. Хляб (Недовършена)
  // ==========================================
  {
    title: "Хляб (Недовършена)",
    description: "Домашен хляб — основна рецепта с пропорции. (Липсват подробни стъпки.)",
    category: "Хляб",
    servings: null,
    prepTime: null,
    cookTime: null,
    ingredients: [
      { name: "брашно", quantity: 1, unit: "кг" },
      { name: "яйце", quantity: 1, unit: "бр" },
      { name: "мляко", quantity: 200, unit: "мл" },
      { name: "олио/масло", quantity: null, unit: null },
      { name: "вода (топла)", quantity: null, unit: null },
    ],
    steps: [],
  },

  // ==========================================
  // 18. Питки за бургери
  // ==========================================
  {
    title: "Питки за бургери",
    description: "Домашни пухкави питки за бургери — меко тесто с мая, поръсени със сусам.",
    category: "Хляб",
    servings: 12,
    prepTime: 70,
    cookTime: 25,
    ingredients: [
      { name: "хладко прясно мляко", quantity: 250, unit: "мл" },
      { name: "хладка вода", quantity: 250, unit: "мл" },
      { name: "олио", quantity: 125, unit: "мл" },
      { name: "големи яйца (размер L)", quantity: 2, unit: "бр" },
      { name: "прясна мая (половин кубче)", quantity: 20, unit: "г" },
      { name: "захар", quantity: 0.5, unit: "с.л." },
      { name: "сол", quantity: 1, unit: "равна с.л." },
      { name: "брашно (не цял кг — тестото да е лепкаво и меко)", quantity: 920, unit: "г" },
      { name: "вода (за намазване)", quantity: null, unit: "малко" },
      { name: "сусам (за поръсване)", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "Смесват се водата и млякото в дълбок съд. Слагат се маята и захарта, разбъркват се." },
      { stepNumber: 2, instruction: "Прибавят се яйцата и олиото, разбъркват се с останалите течни продукти." },
      { stepNumber: 3, instruction: "Добавя се половината брашно и се разбърква с лъжица. Слага се солта и на части се прибавя останалото брашно, като се започва да се меси с ръце." },
      { stepNumber: 4, instruction: "Тестото трябва да е леко лепкаво и меко — не слагайте цял килограм брашно." },
      { stepNumber: 5, instruction: "Поръсва се с брашно, покрива се с кърпа и се оставя 30-35 мин на топло да втаса." },
      { stepNumber: 6, instruction: "Разделя се на 12 еднакви парчета, оформят се на кръгли питки и се подреждат на малко разстояние в тава с хартия за печене." },
      { stepNumber: 7, instruction: "Тавата се слага във фурната на 50 градуса за 15-20 мин да втасат повторно." },
      { stepNumber: 8, instruction: "Намазват се с малко вода, поръсват се със сусам." },
      { stepNumber: 9, instruction: "Фурната се пуска на 190 градуса и се пекат около 25 минути." },
    ],
  },

  // ==========================================
  // 19. Баница
  // ==========================================
  {
    title: "Баница",
    description: "Класическа баница с кори на розички, сирене и заливка от яйца и мляко.",
    category: "Закуски",
    servings: null,
    prepTime: 20,
    cookTime: 45,
    ingredients: [
      { name: "кори (6 + 5 + 4)", quantity: 15, unit: "бр" },
      { name: "сирене (или сирене и извара 50/50)", quantity: null, unit: null },
      { name: "олио", quantity: null, unit: null },
      { name: "яйца", quantity: 6, unit: "бр" },
      { name: "мляко", quantity: 500, unit: "мл" },
      { name: "масло (парчета за отгоре)", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "Тавата се намазва с олио." },
      { stepNumber: 2, instruction: "Първи пласт — 6 кори, свити на розички, покриват тавата изцяло. Отгоре се натрушава сирене." },
      { stepNumber: 3, instruction: "Втори пласт — същото с 5 кори." },
      { stepNumber: 4, instruction: "Трети пласт — същото с 4 кори." },
      { stepNumber: 5, instruction: "Реже се на 8 части." },
      { stepNumber: 6, instruction: "Полива се с малко олио в прорезите." },
      { stepNumber: 7, instruction: "Прави се смес от 6 яйца и 500 мл мляко, разбива се и се полива цялата баница." },
      { stepNumber: 8, instruction: "Режат се малки парчета масло и се слагат отгоре." },
      { stepNumber: 9, instruction: "Пече се около 45 мин на 180° (или 200°)." },
    ],
  },

  // ==========================================
  // 20. Шакшука с нахут (Недовършена)
  // ==========================================
  {
    title: "Шакшука с нахут (Недовършена)",
    description: "Шакшука с нахут и спанак. (Липсват стъпки за приготвяне.)",
    category: "Основни ястия",
    servings: null,
    prepTime: null,
    cookTime: null,
    ingredients: [
      { name: "кашу (несолено)", quantity: 30, unit: "г" },
      { name: "пресен лук", quantity: 1, unit: "връзка" },
      { name: "кори паста \"Корма\"", quantity: 2, unit: "ч.л. (препълнени)" },
      { name: "нахут", quantity: 1, unit: "консерва (400 г)" },
      { name: "кокосова сметана", quantity: 1, unit: "с.л." },
      { name: "бейби спанак", quantity: 100, unit: "г" },
      { name: "яйца", quantity: 4, unit: "бр" },
      { name: "натурално кисело мляко", quantity: 2, unit: "с.л." },
    ],
    steps: [],
  },

  // ==========================================
  // 21. Варен ориз
  // ==========================================
  {
    title: "Варен ориз",
    description: "Основна рецепта за варен ориз — пропорция 1:2.",
    category: "Гарнитури",
    servings: null,
    prepTime: 1,
    cookTime: 15,
    ingredients: [
      { name: "ориз", quantity: 1, unit: "чаша" },
      { name: "вода", quantity: 2, unit: "чаши" },
      { name: "олио/зехтин", quantity: null, unit: null },
      { name: "сол", quantity: null, unit: null },
    ],
    steps: [
      { stepNumber: 1, instruction: "В тенджера се слагат оризът, водата, олио/зехтин и сол." },
      { stepNumber: 2, instruction: "Като заври оризът, слага се на най-ниската степен на котлона." },
      { stepNumber: 3, instruction: "Слага се капакът и се оставя, докато поеме водата." },
    ],
  },

  // ==========================================
  // 22. Картофи в Air Fryer (Недовършена)
  // ==========================================
  {
    title: "Картофи в Air Fryer (Недовършена)",
    description: "Картофи в Air Fryer с подправки. (Липсват стъпки и време за готвене.)",
    category: "Гарнитури",
    servings: null,
    prepTime: null,
    cookTime: null,
    ingredients: [
      { name: "картофи", quantity: null, unit: null },
      { name: "зехтин", quantity: 2, unit: "с.л." },
      { name: "сол", quantity: 2, unit: "ч.л." },
      { name: "риган", quantity: null, unit: null },
      { name: "черен пипер", quantity: null, unit: null },
      { name: "червен пипер", quantity: null, unit: null },
    ],
    steps: [],
  },
];

async function seed() {
  console.log("Seeding all recipes...\n");

  // Ensure "Хляб" category exists
  const hlyabExists = await prisma.category.findUnique({ where: { name: "Хляб" } });
  if (!hlyabExists) {
    await prisma.category.create({ data: { name: "Хляб", isPreset: true } });
    console.log("Created new category: Хляб\n");
  }

  // Load all categories
  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((c) => [c.name, c.id]));

  let created = 0;
  let skipped = 0;

  for (const r of recipes) {
    // Check if recipe already exists
    const existing = await prisma.recipe.findFirst({ where: { title: r.title } });
    if (existing) {
      console.log(`  Skipped (already exists): ${r.title}`);
      skipped++;
      continue;
    }

    const categoryId = categoryMap.get(r.category);
    if (!categoryId) {
      console.error(`  ERROR: Category "${r.category}" not found for recipe "${r.title}". Skipping.`);
      skipped++;
      continue;
    }

    const recipe = await prisma.recipe.create({
      data: {
        title: r.title,
        description: r.description,
        categoryId,
        servings: r.servings,
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        ingredients: {
          create: r.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        },
        steps: {
          create: r.steps.map((step) => ({
            stepNumber: step.stepNumber,
            instruction: step.instruction,
          })),
        },
      },
    });

    console.log(`  Created: ${recipe.title} (id: ${recipe.id})`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
