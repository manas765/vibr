export default async function handler(req, res) {
  const apiKey = process.env.CURRENTS_API_KEY;

  const url = `https://api.currentsapi.services/v1/search?keywords=music%20album%20artist%20concert&language=en&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    const news = (data.news || []).slice(0, 12).map((article) => ({
      id: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.image !== "None" ? article.image : null,
      author: article.author,
      published: article.published,
    }));

    return res.status(200).json({ news });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch music news" });
  }
}