import React from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Grid, Card, CardMedia, Container, Typography, CssBaseline, Button, useTheme } from '@mui/material';
// import "./Home.css";

const Home = ({ userDetails }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const images = [
    {
      title: "Leather Sofa",
      src: "https://assets.wfcdn.com/im/52254190/compr-r85/2083/208369192/Ardrie+83.8%27%27+Mid-Century+Modern+Furniture+Style+Genuine+Leather+Chesterfield+Sofa.jpg"
    },
    {
      title: "Wooden Dining Table",
      src: "https://img5.su-cdn.com/cdn-cgi/image/width=1000,height=1000/mall/file/2022/01/20/69c43fb332794a4191d4f547002175ca.jpg"
    },
    {
      title: "Glass Coffee Table",
      src: "https://d9dvmj2a7k2dc.cloudfront.net/catalog/product/c/a/candice_2_lg_g20201.jpg"
    },
    {
      title: "Fabric Armchair",
      src: "https://m.media-amazon.com/images/I/61aH4Eg6c7L.jpg"
    },
    {
      title: "Mirror Wardrobe",
      src: "https://www.fabglassandmirror.com/blog/wp-content/uploads/2022/05/Custom-mirror-for-your-closet.png"
    },
    {
      title: "Plastic Outdoor Chair",
      src: "https://i5.walmartimages.com/seo/WORTH-Folding-Adirondack-Chair-Plastic-Outdoor-Patio-Chairs-Weather-Resistant-Outdoor-Patio-Furniture-Fire-Pit-Chair-for-Garden-or-Beach-Black_7a9bab0c-abde-4726-afe0-fe77d7628e15.846436b9ed1d9ff70ed18e1818df8395.jpeg"
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      <Container maxWidth="lg" className="container" sx={{p:0}}>
        <Box className="home-background" sx={{ bgcolor: theme.palette.background.paper }}>
          
            <Typography variant="h2" component="h1"  color={theme.palette.text.primary}>
              Automach
            </Typography>
            <Typography variant="h6" component="p" color={theme.palette.text.secondary}>
              AutoMach is a process management tool for streamlining day-to-day activities in a process-oriented manufacturing hub.
              It tunes your process by digitizing data and enhancing production cycles using smart prediction systems that can provide insights across multiple departments.
            </Typography>
            <Button variant="contained" className="home-button" sx={{ bgcolor: theme.palette.primary.main }}>
              Explore
            </Button>
          
        </Box>

        <Box mt={5}>
          <Grid container spacing={4} className="grid-container">
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="card" sx={{ bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[3] }}>
                  <CardMedia
                    component="img"
                    image={image.src}
                    alt={image.title}
                  />
                  <Typography variant="subtitle1" className="card-title" color={theme.palette.text.primary}>
                    {image.title}
                  </Typography>
                  <Typography variant="body1" textAlign="center" color={theme.palette.text.secondary}>
                    ${index * 100 + 100}.00
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
