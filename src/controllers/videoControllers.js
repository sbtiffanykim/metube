export const trending = (req, res) => {
  const videos = [
    {
      title: "video #1",
      rating: 5,
      comments: 2,
      createdAt: "2 minutes ago",
      views: 59,
      id: 1,
    },
    {
      title: "video #2",
      rating: 3,
      comments: 9,
      createdAt: "24 minutes ago",
      views: 5,
      id: 13,
    },
    {
      title: "video #3",
      rating: 4.5,
      comments: 25,
      createdAt: "12 minutes ago",
      views: 135,
      id: 15,
    },
  ];
  return res.render("home", { pageTitle: "Home", videos });
};
export const see = (req, res) =>
  res.render("watch", { pageTitle: "Watch video" });
export const edit = (req, res) =>
  res.render("edit", { pageTitle: "Edit video" });

export const deleteVideo = (req, res) => {
  return res.send(`Delete Video # ${req.params.id}`);
};
export const search = (req, res) => res.send("Search for a video");
export const upload = (req, res) => res.send("Upload a Video");
