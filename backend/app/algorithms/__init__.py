
from typing import List, Tuple, Optional, Dict, Any
from collections import OrderedDict
from datetime import datetime
import math
import logging

logger = logging.getLogger(__name__)

class EloRating:
    
    DEFAULT_RATING = 1000
    K_FACTOR_NEW = 40
    K_FACTOR_NORMAL = 24
    K_FACTOR_MASTER = 16
    
    @classmethod
    def expected_score(cls, rating_a: int, rating_b: int) -> float:
        exponent = (rating_b - rating_a) / 400
        return 1 / (1 + math.pow(10, exponent))
    
    @classmethod
    def get_k_factor(cls, games_played: int) -> int:
        if games_played < 30:
            return cls.K_FACTOR_NEW
        elif games_played < 100:
            return cls.K_FACTOR_NORMAL
        else:
            return cls.K_FACTOR_MASTER
    
    @classmethod
    def calculate_new_ratings(
        cls,
        winner_rating: int,
        loser_rating: int,
        winner_games: int = 50,
        loser_games: int = 50
    ) -> Tuple[int, int]:
        expected_winner = cls.expected_score(winner_rating, loser_rating)
        expected_loser = 1 - expected_winner
        
        k_winner = cls.get_k_factor(winner_games)
        k_loser = cls.get_k_factor(loser_games)
        
        new_winner = winner_rating + k_winner * (1 - expected_winner)
        new_loser = loser_rating + k_loser * (0 - expected_loser)
        
        return (
            max(100, round(new_winner)),
            max(100, round(new_loser))
        )
    
    @classmethod
    def calculate_draw(
        cls,
        rating_a: int,
        rating_b: int,
        games_a: int = 50,
        games_b: int = 50
    ) -> Tuple[int, int]:
        expected_a = cls.expected_score(rating_a, rating_b)
        expected_b = 1 - expected_a
        
        k_a = cls.get_k_factor(games_a)
        k_b = cls.get_k_factor(games_b)
        
        new_a = rating_a + k_a * (0.5 - expected_a)
        new_b = rating_b + k_b * (0.5 - expected_b)
        
        return (max(100, round(new_a)), max(100, round(new_b)))
    
    @classmethod
    def get_rank_tier(cls, rating: int) -> Dict[str, Any]:
        tiers = [
            (2400, "Grandmaster", "#ffd700", "👑"),
            (2200, "Master", "#c0c0c0", "🏆"),
            (2000, "Diamond", "#b9f2ff", "💎"),
            (1800, "Platinum", "#e5e4e2", "🥇"),
            (1600, "Gold", "#ffd700", "🥈"),
            (1400, "Silver", "#c0c0c0", "🥉"),
            (1200, "Bronze", "#cd7f32", "⚔️"),
            (1000, "Iron", "#43464b", "🗡️"),
            (0, "Newcomer", "#94a3b8", "📜"),
        ]
        
        for threshold, name, color, icon in tiers:
            if rating >= threshold:
                return {
                    "name": name,
                    "color": color,
                    "icon": icon,
                    "rating": rating,
                    "next_tier": tiers[max(0, tiers.index((threshold, name, color, icon)) - 1)][0]
                }
        
        return {"name": "Unranked", "color": "#gray", "icon": "❓", "rating": rating}

class LRUCache:
    
    def __init__(self, max_size: int = 1000, default_ttl: int = 3600):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self._cache: OrderedDict = OrderedDict()
        self._expiry: Dict[str, float] = {}
    
    def get(self, key: str) -> Optional[Any]:
        if key not in self._cache:
            return None
        
        if key in self._expiry:
            if datetime.now().timestamp() > self._expiry[key]:
                self._remove(key)
                return None
        
        self._cache.move_to_end(key)
        return self._cache[key]
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        if key in self._cache:
            del self._cache[key]
        
        self._cache[key] = value
        
        ttl = ttl or self.default_ttl
        self._expiry[key] = datetime.now().timestamp() + ttl
        
        while len(self._cache) > self.max_size:
            self._evict_oldest()
    
    def _remove(self, key: str) -> None:
        if key in self._cache:
            del self._cache[key]
        if key in self._expiry:
            del self._expiry[key]
    
    def _evict_oldest(self) -> None:
        if self._cache:
            oldest_key = next(iter(self._cache))
            self._remove(oldest_key)
    
    def clear(self) -> None:
        self._cache.clear()
        self._expiry.clear()
    
    @property
    def size(self) -> int:
        return len(self._cache)
    
    def stats(self) -> Dict[str, Any]:
        return {
            "size": self.size,
            "max_size": self.max_size,
            "utilization": f"{(self.size / self.max_size) * 100:.1f}%"
        }

class FuzzySearch:
    
    @staticmethod
    def levenshtein_distance(s1: str, s2: str) -> int:
        if len(s1) < len(s2):
            return FuzzySearch.levenshtein_distance(s2, s1)
        
        if len(s2) == 0:
            return len(s1)
        
        previous_row = range(len(s2) + 1)
        
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1.lower() != c2.lower())
                
                current_row.append(min(insertions, deletions, substitutions))
            
            previous_row = current_row
        
        return previous_row[-1]
    
    @classmethod
    def similarity_ratio(cls, s1: str, s2: str) -> float:
        max_len = max(len(s1), len(s2))
        if max_len == 0:
            return 1.0
        
        distance = cls.levenshtein_distance(s1, s2)
        return 1 - (distance / max_len)
    
    @classmethod
    def find_best_matches(
        cls,
        query: str,
        candidates: List[str],
        threshold: float = 0.6,
        limit: int = 10
    ) -> List[Tuple[str, float]]:
        matches = []
        query_lower = query.lower()
        
        for candidate in candidates:
            if candidate.lower().startswith(query_lower):
                matches.append((candidate, 1.0))
            else:
                ratio = cls.similarity_ratio(query, candidate)
                if ratio >= threshold:
                    matches.append((candidate, ratio))
        
        matches.sort(key=lambda x: x[1], reverse=True)
        
        return matches[:limit]

class RecommendationEngine:
    
    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        if len(vec_a) != len(vec_b) or len(vec_a) == 0:
            return 0.0
        
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        magnitude_a = math.sqrt(sum(a ** 2 for a in vec_a))
        magnitude_b = math.sqrt(sum(b ** 2 for b in vec_b))
        
        if magnitude_a == 0 or magnitude_b == 0:
            return 0.0
        
        return dot_product / (magnitude_a * magnitude_b)
    
    @classmethod
    def find_similar_users(
        cls,
        target_user_ratings: Dict[int, float],
        all_users_ratings: Dict[str, Dict[int, float]],
        limit: int = 10
    ) -> List[Tuple[str, float]]:
        all_anime = set(target_user_ratings.keys())
        for ratings in all_users_ratings.values():
            all_anime.update(ratings.keys())
        
        all_anime = sorted(all_anime)
        
        target_vector = [target_user_ratings.get(a, 0) for a in all_anime]
        
        similarities = []
        for user_id, ratings in all_users_ratings.items():
            user_vector = [ratings.get(a, 0) for a in all_anime]
            similarity = cls.cosine_similarity(target_vector, user_vector)
            
            if similarity > 0:
                similarities.append((user_id, similarity))
        
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:limit]
    
    @classmethod
    def recommend_anime(
        cls,
        user_ratings: Dict[int, float],
        all_users_ratings: Dict[str, Dict[int, float]],
        limit: int = 10
    ) -> List[Tuple[int, float]]:
        similar_users = cls.find_similar_users(user_ratings, all_users_ratings)
        
        if not similar_users:
            return []
        
        anime_scores: Dict[int, List[Tuple[float, float]]] = {}
        
        for user_id, similarity in similar_users:
            user_ratings_data = all_users_ratings.get(user_id, {})
            
            for anime_id, rating in user_ratings_data.items():
                if anime_id not in user_ratings:
                    if anime_id not in anime_scores:
                        anime_scores[anime_id] = []
                    anime_scores[anime_id].append((rating, similarity))
        
        recommendations = []
        for anime_id, scores in anime_scores.items():
            weighted_sum = sum(rating * sim for rating, sim in scores)
            similarity_sum = sum(sim for _, sim in scores)
            
            if similarity_sum > 0:
                predicted_rating = weighted_sum / similarity_sum
                recommendations.append((anime_id, predicted_rating))
        
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations[:limit]

elo_rating = EloRating()
fuzzy_search = FuzzySearch()
recommendation_engine = RecommendationEngine()

hot_cache = LRUCache(max_size=500, default_ttl=300)
