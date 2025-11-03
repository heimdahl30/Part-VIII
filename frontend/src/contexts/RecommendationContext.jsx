import { createContext, useState, useContext } from "react";

const RecommendationContext = createContext({
  favoriteGenre: null,
  setFavoriteGenre: () => {},
});

export const useRecommendation = () => useContext(RecommendationContext);

export const RecommendationProvider = ({ children }) => {
  const [favoriteGenre, setFavoriteGenre] = useState(null);

  const value = {
    favoriteGenre,
    setFavoriteGenre,
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};
