import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Paper, InputBase, IconButton, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, ClickAwayListener } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { productApi } from "../../api/productApi.js";
import { getProductImageUrl } from "../../utils/getImageUrl.js";

export default function SearchBox() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const debounceRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
    setSuggestions([]);
    setOpen(false);
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await productApi.list({ search: searchTerm, limit: 5 });
        setSuggestions(data.data.products || []);
        setOpen(true);
      } catch (err) {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  useEffect(() => {
    setSuggestions([]);
    setOpen(false);
  }, [location]);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative", width: { xs: "100%", md: 500 } }}>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "background.default",
            borderRadius: 30,
            border: "1px solid",
            borderColor: "primary.main",
            overflow: "hidden",
          }}
        >
          <InputBase
            placeholder="Search For Products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            sx={{ height: 45, flex: 1, px: 2.5, color: "text.primary" }}
          />
          <IconButton
            type="submit"
            sx={{ height: 45, width: 60, borderRadius: 0, bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } }}
          >
            <SearchIcon />
          </IconButton>
        </Paper>

        {open && suggestions.length > 0 && (
          <Paper
            sx={{
              position: "absolute",
              top: "105%",
              left: 4,
              width: "88%",
              zIndex: 10000,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              p: 0.5,
            }}
          >
            <List dense disablePadding>
              {suggestions.map((item, idx) => (
                <ListItemButton
                  key={item.id}
                  onClick={() => {
                    navigate(`/product/${item.slug}`);
                    setOpen(false);
                  }}
                  sx={{ borderBottom: idx !== suggestions.length - 1 ? "1px solid" : "none", borderColor: "divider" }}
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar variant="square" src={getProductImageUrl(item.images?.[0])} sx={{ width: 30, height: 30 }} />
                  </ListItemAvatar>
                  <ListItemText primaryTypographyProps={{ fontSize: 14 }} primary={item.name} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
