/**
 * Batch fetch Wikipedia images for schools missing photos.
 * Outputs SQL UPDATE statements for each school that has an image.
 *
 * Usage: node scripts/fetch-wiki-images.mjs > scripts/update-images.sql
 */

const schools = [
  {id:1,name:"Albany Medical College"},
  {id:2,name:"Albert Einstein College of Medicine"},
  {id:3,name:"Alice L. Walton School of Medicine"},
  {id:4,name:"Anne Burnett Marion School of Medicine at TCU",alt:"Texas Christian University"},
  {id:8,name:"California Northstate University College of Medicine",alt:"California Northstate University"},
  {id:9,name:"California University of Science and Medicine"},
  {id:10,name:"Carle Illinois College of Medicine"},
  {id:17,name:"Cooper Medical School of Rowan University",alt:"Rowan University"},
  {id:20,name:"Donald and Barbara Zucker School of Medicine at Hofstra/Northwell",alt:"Hofstra University"},
  {id:23,name:"East Tennessee State University",alt:"East Tennessee State University"},
  {id:24,name:"Eastern Virginia Medical School",alt:"Old Dominion University"},
  {id:26,name:"Florida International University Herbert Wertheim College of Medicine",alt:"Florida International University"},
  {id:28,name:"Frank H. Netter MD School of Medicine at Quinnipiac University",alt:"Quinnipiac University"},
  {id:29,name:"University of South Alabama",alt:"University of South Alabama"},
  {id:31,name:"Geisinger Commonwealth School of Medicine",alt:"Geisinger Health System"},
  {id:34,name:"Hackensack Meridian School of Medicine",alt:"Hackensack University Medical Center"},
  {id:39,name:"Jacobs School of Medicine and Biomedical Sciences",alt:"University at Buffalo"},
  {id:41,name:"Kaiser Permanente Bernard J. Tyson School of Medicine",alt:"Kaiser Permanente"},
  {id:43,name:"Kirk Kerkorian School of Medicine at UNLV",alt:"University of Nevada, Las Vegas"},
  {id:46,name:"Louisiana State University School of Medicine in New Orleans",alt:"Louisiana State University Health Sciences Center New Orleans"},
  {id:47,name:"Louisiana State University School of Medicine in Shreveport",alt:"Louisiana State University Health Sciences Center Shreveport"},
  {id:48,name:"Loyola University Chicago Stritch School of Medicine",alt:"Loyola University Chicago"},
  {id:49,name:"Marshall University Joan C. Edwards School of Medicine",alt:"Marshall University"},
  {id:51,name:"McGovern Medical School",alt:"University of Texas Health Science Center at Houston"},
  {id:52,name:"Medical College of Georgia at Augusta University",alt:"Augusta University"},
  {id:54,name:"Medical University of South Carolina",alt:"Medical University of South Carolina"},
  {id:56,name:"Mercer University School of Medicine",alt:"Mercer University"},
  {id:57,name:"Michigan State University College of Human Medicine",alt:"Michigan State University"},
  {id:60,name:"Northeast Ohio Medical University"},
  {id:62,name:"Nova Southeastern University",alt:"Nova Southeastern University"},
  {id:63,name:"NYU Grossman Long Island School of Medicine",alt:"NYU Langone Health"},
  {id:65,name:"Oakland University William Beaumont School of Medicine",alt:"Oakland University"},
  {id:67,name:"Oregon Health & Science University",alt:"Oregon Health & Science University"},
  {id:68,name:"Pennsylvania State University College of Medicine",alt:"Penn State College of Medicine"},
  {id:70,name:"Ponce Health Sciences University"},
  {id:71,name:"Renaissance School of Medicine at Stony Brook University",alt:"Stony Brook University"},
  {id:72,name:"University of Vermont Larner College of Medicine",alt:"University of Vermont"},
  {id:73,name:"Roseman University of Health Sciences",alt:"Roseman University of Health Sciences"},
  {id:76,name:"Rutgers Robert Wood Johnson Medical School",alt:"Rutgers University"},
  {id:78,name:"San Juan Bautista School of Medicine"},
  {id:80,name:"Southern Illinois University School of Medicine",alt:"Southern Illinois University"},
  {id:81,name:"Spencer Fox Eccles School of Medicine at the University of Utah",alt:"University of Utah"},
  {id:83,name:"SUNY Upstate Medical University",alt:"SUNY Upstate Medical University"},
  {id:84,name:"SUNY Downstate Health Sciences University",alt:"SUNY Downstate Medical Center"},
  {id:85,name:"Texas A&M University College of Medicine",alt:"Texas A&M University"},
  {id:86,name:"Texas Tech University Health Sciences Center El Paso",alt:"Texas Tech University Health Sciences Center El Paso"},
  {id:87,name:"Texas Tech University Health Sciences Center",alt:"Texas Tech University Health Sciences Center"},
  {id:88,name:"Dell Medical School",alt:"University of Texas at Austin"},
  {id:89,name:"University of Texas at Tyler",alt:"University of Texas at Tyler"},
  {id:90,name:"UT Health San Antonio",alt:"University of Texas Health Science Center at San Antonio"},
  {id:91,name:"University of Toledo",alt:"University of Toledo"},
  {id:93,name:"Belmont University",alt:"Belmont University"},
  {id:96,name:"Uniformed Services University of the Health Sciences"},
  {id:97,name:"Universidad Central del Caribe"},
  {id:98,name:"University of Alabama at Birmingham",alt:"University of Alabama at Birmingham"},
  {id:100,name:"University of Arizona College of Medicine – Phoenix",alt:"University of Arizona"},
  {id:101,name:"University of Arkansas for Medical Sciences",alt:"University of Arkansas for Medical Sciences"},
  {id:102,name:"UC Davis School of Medicine",alt:"University of California, Davis"},
  {id:103,name:"UC Irvine School of Medicine",alt:"University of California, Irvine"},
  {id:105,name:"UC Riverside School of Medicine",alt:"University of California, Riverside"},
  {id:106,name:"UC San Diego School of Medicine",alt:"University of California, San Diego"},
  {id:108,name:"University of Central Florida College of Medicine",alt:"University of Central Florida"},
  {id:110,name:"University of Cincinnati College of Medicine",alt:"University of Cincinnati"},
  {id:111,name:"University of Colorado School of Medicine",alt:"University of Colorado"},
  {id:112,name:"University of Connecticut School of Medicine",alt:"University of Connecticut"},
  {id:114,name:"John A. Burns School of Medicine",alt:"University of Hawaii at Manoa"},
  {id:115,name:"University of Houston",alt:"University of Houston"},
  {id:116,name:"University of Illinois College of Medicine",alt:"University of Illinois Chicago"},
  {id:117,name:"University of Iowa Carver College of Medicine",alt:"University of Iowa"},
  {id:118,name:"University of Kansas School of Medicine",alt:"University of Kansas"},
  {id:119,name:"University of Kentucky College of Medicine",alt:"University of Kentucky"},
  {id:120,name:"University of Louisville School of Medicine",alt:"University of Louisville"},
  {id:122,name:"UMass Chan Medical School",alt:"University of Massachusetts Medical School"},
  {id:123,name:"University of Miami Miller School of Medicine",alt:"University of Miami"},
  {id:125,name:"University of Minnesota Medical School",alt:"University of Minnesota"},
  {id:126,name:"University of Mississippi Medical Center",alt:"University of Mississippi"},
  {id:127,name:"University of Missouri School of Medicine",alt:"University of Missouri"},
  {id:128,name:"University of Missouri–Kansas City School of Medicine",alt:"University of Missouri–Kansas City"},
  {id:129,name:"University of Nebraska Medical Center",alt:"University of Nebraska Medical Center"},
  {id:130,name:"University of Nevada, Reno School of Medicine",alt:"University of Nevada, Reno"},
  {id:131,name:"University of New Mexico School of Medicine",alt:"University of New Mexico"},
  {id:133,name:"University of North Dakota School of Medicine",alt:"University of North Dakota"},
  {id:134,name:"University of Oklahoma College of Medicine",alt:"University of Oklahoma"},
  {id:136,name:"University of Puerto Rico School of Medicine",alt:"University of Puerto Rico"},
  {id:137,name:"University of Rochester School of Medicine and Dentistry",alt:"University of Rochester"},
  {id:138,name:"University of South Carolina School of Medicine",alt:"University of South Carolina"},
  {id:139,name:"University of South Carolina School of Medicine Greenville",alt:"University of South Carolina"},
  {id:140,name:"Sanford School of Medicine",alt:"University of South Dakota"},
  {id:141,name:"University of Tennessee Health Science Center",alt:"University of Tennessee"},
  {id:142,name:"University of Texas Medical Branch",alt:"University of Texas Medical Branch"},
  {id:143,name:"University of Texas Rio Grande Valley",alt:"University of Texas Rio Grande Valley"},
  {id:144,name:"UT Southwestern Medical Center",alt:"University of Texas Southwestern Medical Center"},
  {id:147,name:"University of Wisconsin School of Medicine and Public Health",alt:"University of Wisconsin–Madison"},
  {id:148,name:"USF Health Morsani College of Medicine",alt:"University of South Florida"},
  {id:150,name:"Virginia Commonwealth University School of Medicine",alt:"Virginia Commonwealth University"},
  {id:151,name:"Virginia Tech Carilion School of Medicine",alt:"Virginia Tech"},
  {id:152,name:"Wake Forest University School of Medicine",alt:"Wake Forest University"},
  {id:153,name:"Washington State University Elson S. Floyd College of Medicine",alt:"Washington State University"},
  {id:155,name:"Wayne State University School of Medicine",alt:"Wayne State University"},
  {id:157,name:"West Virginia University School of Medicine",alt:"West Virginia University"},
  {id:158,name:"Western Michigan University Homer Stryker M.D. School of Medicine",alt:"Western Michigan University"},
  {id:159,name:"Wright State University Boonshoft School of Medicine",alt:"Wright State University"},
  {id:162,name:"Alabama College of Osteopathic Medicine"},
  {id:163,name:"Edward Via College of Osteopathic Medicine",alt:"Edward Via College of Osteopathic Medicine"},
  {id:164,name:"A.T. Still University",alt:"A.T. Still University"},
  {id:165,name:"Midwestern University",alt:"Midwestern University"},
  {id:166,name:"Arkansas College of Osteopathic Medicine"},
  {id:167,name:"California Health Sciences University"},
  {id:168,name:"Touro University California",alt:"Touro University California"},
  {id:169,name:"Western University of Health Sciences",alt:"Western University of Health Sciences"},
  {id:170,name:"Rocky Vista University",alt:"Rocky Vista University"},
  {id:171,name:"Lake Erie College of Osteopathic Medicine",alt:"Lake Erie College of Osteopathic Medicine"},
  {id:172,name:"Nova Southeastern University",alt:"Nova Southeastern University"},
  {id:173,name:"Orlando College of Osteopathic Medicine"},
  {id:174,name:"Philadelphia College of Osteopathic Medicine",alt:"Philadelphia College of Osteopathic Medicine"},
  {id:175,name:"Idaho College of Osteopathic Medicine"},
  {id:176,name:"Midwestern University",alt:"Midwestern University"},
  {id:177,name:"Marian University",alt:"Marian University (Indiana)"},
  {id:178,name:"Des Moines University",alt:"Des Moines University"},
  {id:179,name:"Kansas Health Science Center"},
  {id:180,name:"University of Pikeville",alt:"University of Pikeville"},
  {id:181,name:"Edward Via College of Osteopathic Medicine",alt:"Edward Via College of Osteopathic Medicine"},
  {id:182,name:"University of New England",alt:"University of New England (United States)"},
  {id:183,name:"Michigan State University College of Osteopathic Medicine",alt:"Michigan State University"},
  {id:184,name:"William Carey University",alt:"William Carey University"},
  {id:185,name:"A.T. Still University",alt:"A.T. Still University"},
  {id:186,name:"Kansas City University",alt:"Kansas City University"},
  {id:187,name:"Touro University",alt:"Touro University"},
  {id:188,name:"Touro University Nevada"},
  {id:189,name:"Rowan University School of Osteopathic Medicine",alt:"Rowan University"},
  {id:190,name:"Burrell College of Osteopathic Medicine",alt:"New Mexico State University"},
  {id:191,name:"New York Institute of Technology",alt:"New York Institute of Technology"},
  {id:192,name:"Touro College of Osteopathic Medicine",alt:"Touro University"},
  {id:193,name:"Campbell University",alt:"Campbell University"},
  {id:194,name:"Ohio University Heritage College of Osteopathic Medicine",alt:"Ohio University"},
  {id:195,name:"Oklahoma State University Center for Health Sciences",alt:"Oklahoma State University"},
  {id:196,name:"Lake Erie College of Osteopathic Medicine",alt:"Lake Erie College of Osteopathic Medicine"},
  {id:197,name:"Philadelphia College of Osteopathic Medicine",alt:"Philadelphia College of Osteopathic Medicine"},
  {id:198,name:"Duquesne University",alt:"Duquesne University"},
  {id:199,name:"Edward Via College of Osteopathic Medicine",alt:"Edward Via College of Osteopathic Medicine"},
  {id:200,name:"Lincoln Memorial University",alt:"Lincoln Memorial University"},
  {id:201,name:"Baptist Health Sciences University"},
  {id:202,name:"University of North Texas Health Science Center",alt:"University of North Texas Health Science Center"},
  {id:203,name:"Sam Houston State University",alt:"Sam Houston State University"},
  {id:204,name:"University of the Incarnate Word",alt:"University of the Incarnate Word"},
  {id:205,name:"Noorda College of Osteopathic Medicine"},
  {id:206,name:"Edward Via College of Osteopathic Medicine",alt:"Edward Via College of Osteopathic Medicine"},
  {id:207,name:"Liberty University",alt:"Liberty University"},
  {id:208,name:"Pacific Northwest University of Health Sciences"},
  {id:209,name:"West Virginia School of Osteopathic Medicine"},
];

async function fetchWikipediaImage(title) {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MedStack/1.0 (medical school explorer; contact@mymedstack.com)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source || data.originalimage?.source || null;
  } catch {
    return null;
  }
}

async function processSchool(school) {
  // Try the school name first
  let imageUrl = await fetchWikipediaImage(school.name);

  // Try the alt name if no image found
  if (!imageUrl && school.alt) {
    imageUrl = await fetchWikipediaImage(school.alt);
  }

  return { id: school.id, name: school.name, imageUrl };
}

async function main() {
  const results = { found: 0, notFound: 0 };
  const sqlStatements = [];
  const notFoundList = [];

  // Process in batches of 10 to be respectful to Wikipedia
  for (let i = 0; i < schools.length; i += 10) {
    const batch = schools.slice(i, i + 10);
    const batchResults = await Promise.all(batch.map(processSchool));

    for (const result of batchResults) {
      if (result.imageUrl) {
        results.found++;
        const escapedUrl = result.imageUrl.replace(/'/g, "''");
        sqlStatements.push(`UPDATE places SET photo_url = '${escapedUrl}' WHERE id = ${result.id};`);
      } else {
        results.notFound++;
        notFoundList.push(`-- NO IMAGE: id=${result.id} name="${result.name}"`);
      }
    }

    // Small delay between batches
    if (i + 10 < schools.length) {
      await new Promise(r => setTimeout(r, 500));
    }

    process.stderr.write(`Processed ${Math.min(i + 10, schools.length)}/${schools.length}...\n`);
  }

  // Output SQL
  console.log('-- Wikipedia image updates for MedStack');
  console.log(`-- Found: ${results.found}, Not found: ${results.notFound}`);
  console.log('');
  for (const sql of sqlStatements) {
    console.log(sql);
  }
  console.log('');
  for (const nf of notFoundList) {
    console.log(nf);
  }
}

main();
