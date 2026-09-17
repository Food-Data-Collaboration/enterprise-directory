import type { DfcEnterprise, LdpContainer } from "$lib/models/dfc";

const BASE = "https://demo.enterprise-directory.invalid/enterprises";

interface DemoRecord {
    slug: string;
    name: string;
    description: string;
    street: string;
    city: string;
    region: string;
    postalCode: string;
    lng: number;
    lat: number;
}

const records = [
    {
        slug: "borough-bread-collective",
        name: "Borough Bread Collective",
        description:
            "A worker-owned bakery beside Borough Market, milling heritage wheat on site and baking long-fermented sourdough every morning before six.",
        street: "8 Southwark Street",
        city: "London",
        region: "Greater London",
        postalCode: "SE1 9AL",
        lng: -0.0910,
        lat: 51.5055
    },
    {
        slug: "harbour-side-bakehouse",
        name: "Harbour Side Bakehouse",
        description:
            "Wood-fired loaves and Somerset cider buns from a converted warehouse on Bristol's floating harbour, supplying cafes across the West Country.",
        street: "14 Prince Street",
        city: "Bristol",
        region: "Bristol",
        postalCode: "BS1 4RN",
        lng: -2.5975,
        lat: 51.4498
    },
    {
        slug: "northern-quarter-sourdough",
        name: "Northern Quarter Sourdough",
        description:
            "A small-batch bakery and grain store in Manchester's Northern Quarter, working exclusively with stone-ground flour from mills in the Peak District.",
        street: "52 Tib Street",
        city: "Manchester",
        region: "Greater Manchester",
        postalCode: "M4 1HN",
        lng: -2.2374,
        lat: 53.4839
    },
    {
        slug: "baltic-triangle-bakers",
        name: "Baltic Triangle Bakers",
        description:
            "Dockside bakery in Liverpool's Baltic Triangle turning out scouse pies, sourdough and Everton toffee tarts for the city's independent traders.",
        street: "3 Jamaica Street",
        city: "Liverpool",
        region: "Merseyside",
        postalCode: "L1 0AH",
        lng: -2.9797,
        lat: 53.3948
    },
    {
        slug: "jewellery-quarter-patisserie",
        name: "Jewellery Quarter Patisserie",
        description:
            "A family patisserie in Birmingham's Jewellery Quarter, third generation, known across the Midlands for laminated pastry and seasonal fruit tarts.",
        street: "27 Vyse Street",
        city: "Birmingham",
        region: "West Midlands",
        postalCode: "B18 6NF",
        lng: -1.9110,
        lat: 52.4880
    },
    {
        slug: "kelham-island-millers",
        name: "Kelham Island Millers",
        description:
            "A community mill and bakery in Sheffield's Kelham Island, grinding Yorkshire-grown rye and spelt for bakers across South Yorkshire.",
        street: "91 Alma Street",
        city: "Sheffield",
        region: "South Yorkshire",
        postalCode: "S3 8SA",
        lng: -1.4715,
        lat: 53.3890
    },
    {
        slug: "ouseburn-valley-bakery",
        name: "Ouseburn Valley Bakery",
        description:
            "Riverside bakery in the Ouseburn Valley producing stotties, singin' hinnies and slow-proved sourdough for Newcastle's markets and cafes.",
        street: "18 Lime Street",
        city: "Newcastle upon Tyne",
        region: "Tyne and Wear",
        postalCode: "NE1 2PQ",
        lng: -1.5977,
        lat: 54.9736
    },
    {
        slug: "jorvik-grain-and-crumb",
        name: "Jorvik Grain & Crumb",
        description:
            "A bakery and grain co-operative within York's walls, specialising in Yorkshire curd tarts, fat rascals and naturally leavened wholemeal.",
        street: "6 Fossgate",
        city: "York",
        region: "North Yorkshire",
        postalCode: "YO1 7LP",
        lng: -1.0800,
        lat: 53.9600
    },
    {
        slug: "the-lanes-bakehouse",
        name: "The Lanes Bakehouse",
        description:
            "A seafront bakehouse tucked into Brighton's Lanes, baking vegan pastries and sea-salt focaccia with Sussex-milled organic flour.",
        street: "11 Ship Street",
        city: "Brighton",
        region: "East Sussex",
        postalCode: "BN1 1HB",
        lng: -0.1372,
        lat: 50.8225
    },
    {
        slug: "norwich-lanes-pie-company",
        name: "Norwich Lanes Pie Company",
        description:
            "Savoury pies and hand-raised pastry made with Norfolk pork and East Anglian wheat, sold from a shopfront in the Norwich Lanes.",
        street: "22 St Benedicts Street",
        city: "Norwich",
        region: "Norfolk",
        postalCode: "NR2 1DX",
        lng: 1.2974,
        lat: 52.6309
    },
    {
        slug: "cowgate-oat-bakery",
        name: "Cowgate Oat Bakery",
        description:
            "An Old Town bakery working almost entirely in Scottish oats: bannocks, oatcakes, cranachan tarts and a dense malted loaf.",
        street: "44 Cowgate",
        city: "Edinburgh",
        region: "City of Edinburgh",
        postalCode: "EH1 1JQ",
        lng: -3.1890,
        lat: 55.9486
    },
    {
        slug: "finnieston-fermentary",
        name: "Finnieston Fermentary",
        description:
            "A bakery and fermentary in Glasgow's Finnieston, pairing long-proved rye breads with kraut, kefir and kombucha made in the same railway arch.",
        street: "7 Argyle Street",
        city: "Glasgow",
        region: "Glasgow City",
        postalCode: "G3 8AZ",
        lng: -4.2800,
        lat: 55.8609
    },
    {
        slug: "granite-city-bannocks",
        name: "Granite City Bannocks",
        description:
            "Aberdeen's oldest surviving bannock bakery, supplying butteries and oat bannocks to harbour crews and north-east grocers since 1927.",
        street: "31 Regent Quay",
        city: "Aberdeen",
        region: "Aberdeenshire",
        postalCode: "AB11 5BQ",
        lng: -2.0943,
        lat: 57.1497
    },
    {
        slug: "highland-croft-bakehouse",
        name: "Highland Croft Bakehouse",
        description:
            "A croft bakery outside Inverness using peat-fired ovens and Highland-grown bere barley for its breads, biscuits and shortbread.",
        street: "9 Church Street",
        city: "Inverness",
        region: "Highland",
        postalCode: "IV1 1DA",
        lng: -4.2247,
        lat: 57.4778
    },
    {
        slug: "cardiff-bay-bara-brith",
        name: "Cardiff Bay Bara Brith",
        description:
            "Welsh tea breads, bara brith and picau ar y maen baked to a family recipe, sold from a unit overlooking Cardiff Bay.",
        street: "5 Bute Crescent",
        city: "Cardiff",
        region: "Cardiff",
        postalCode: "CF10 5BZ",
        lng: -3.1650,
        lat: 51.4645
    },
    {
        slug: "mumbles-morning-loaf",
        name: "Mumbles Morning Loaf",
        description:
            "A Gower-facing bakery in Swansea baking laverbread rolls, Welsh cakes and a salted seaweed sourdough with flour from Carmarthenshire.",
        street: "16 Oystermouth Road",
        city: "Swansea",
        region: "Swansea",
        postalCode: "SA1 1NW",
        lng: -3.9436,
        lat: 51.6214
    },
    {
        slug: "eryri-mountain-bakery",
        name: "Eryri Mountain Bakery",
        description:
            "A mountain bakery at the edge of Eryri, supplying hill farms and hostels with dense rye loaves, flapjack and honey barmbrack.",
        street: "12 High Street",
        city: "Bangor",
        region: "Gwynedd",
        postalCode: "LL57 1DT",
        lng: -4.1290,
        lat: 53.2280
    },
    {
        slug: "cathedral-quarter-bakery",
        name: "Cathedral Quarter Bakery",
        description:
            "A Belfast bakery in the Cathedral Quarter turning out soda bread, potato farls and treacle wheaten for breakfast trade across the city.",
        street: "20 Talbot Street",
        city: "Belfast",
        region: "County Antrim",
        postalCode: "BT1 2LA",
        lng: -5.9270,
        lat: 54.6010
    },
    {
        slug: "foyleside-flour-house",
        name: "Foyleside Flour House",
        description:
            "A mill and bakery on the banks of the Foyle in Derry, stone-grinding Ulster wheat and baking barmbrack, wheaten and fadge daily.",
        street: "4 Shipquay Street",
        city: "Derry",
        region: "County Londonderry",
        postalCode: "BT48 6HL",
        lng: -7.3200,
        lat: 54.9975
    },
    {
        slug: "st-georges-market-bakers",
        name: "St George's Market Bakers",
        description:
            "A market stall and bakery trading out of St George's in Belfast, known for its buttermilk scones, apple tarts and Veda malt loaf.",
        street: "12 East Bridge Street",
        city: "Belfast",
        region: "County Down",
        postalCode: "BT1 3NQ",
        lng: -5.9180,
        lat: 54.5945
    }
] satisfies DemoRecord[];

function toDfcEnterprise(record: DemoRecord): DfcEnterprise {
    const id = `${BASE}/${record.slug}`;

    return {
        "@id": id,
        "dfc-b:name": record.name,
        "dfc-b:hasDescription": record.description,
        "dfc-b:logo": `https://picsum.photos/seed/${record.slug}-logo/96/96`,
        "x-ed:images": [1, 2, 3].map(
            (index) => `https://picsum.photos/seed/${record.slug}-${index}/600/400`
        ),
        "dfc-b:hasAddress": {
            "@id": `${id}/addresses`,
            "ldp:contains": [
                {
                    "@id": `${id}/addresses/1`,
                    "dfc-b:hasStreet": record.street,
                    "dfc-b:hasCity": record.city,
                    "dfc-b:region": record.region,
                    "dfc-b:hasPostalCode": record.postalCode,
                    "dfc-b:hasCountry": "United Kingdom",
                    "dfc-b:longitude": record.lng,
                    "dfc-b:latitude": record.lat
                }
            ]
        }
    };
}

export const ukEnterprises: LdpContainer<DfcEnterprise> = {
    "@id": `${BASE}/`,
    "ldp:contains": records.map(toDfcEnterprise)
};
