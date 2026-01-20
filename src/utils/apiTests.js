

import { 
  jikanAPI, 
  anilistAPI, 
  tmdbAPI, 
  youtubeAPI, 
  searchAnimeAcrossAPIs 
} from './animeAPIs';

export const runAPITests = async () => {
  console.log('🚀 Starting Nakama Network API Integration Tests...\n');

  const results = {
    jikan: { success: false, error: null },
    anilist: { success: false, error: null },
    search: { success: false, error: null },
    trending: { success: false, error: null },
  };

  console.log('📡 Test 1: Jikan API - Trending Anime');
  try {
    const trendingJikan = await jikanAPI.getTrendingAnime();
    if (trendingJikan.length > 0) {
      console.log('✅ Jikan Trending: SUCCESS');
      console.log(`   Found ${trendingJikan.length} trending anime`);
      console.log(`   #1: ${trendingJikan[0].title}`);
      results.jikan.success = true;
    } else {
      throw new Error('No data returned');
    }
  } catch (error) {
    console.error('❌ Jikan Trending: FAILED', error.message);
    results.jikan.error = error.message;
  }

  console.log('\n📡 Test 2: Jikan API - Search');
  try {
    const searchResults = await jikanAPI.searchAnime('Demon Slayer');
    if (searchResults.length > 0) {
      console.log('✅ Jikan Search: SUCCESS');
      console.log(`   Found ${searchResults.length} results for "Demon Slayer"`);
      console.log(`   #1: ${searchResults[0].title} (Score: ${searchResults[0].score})`);
      results.search.success = true;
    } else {
      throw new Error('No search results');
    }
  } catch (error) {
    console.error('❌ Jikan Search: FAILED', error.message);
    results.search.error = error.message;
  }

  console.log('\n📡 Test 3: Jikan API - Random Anime');
  try {
    const randomAnime = await jikanAPI.getRandomAnime();
    if (randomAnime && randomAnime.title) {
      console.log('✅ Jikan Random: SUCCESS');
      console.log(`   Random Anime: ${randomAnime.title}`);
      console.log(`   Score: ⭐${randomAnime.score} | Members: 👥${randomAnime.members}`);
      results.trending.success = true;
    } else {
      throw new Error('No random anime returned');
    }
  } catch (error) {
    console.error('❌ Jikan Random: FAILED', error.message);
    results.trending.error = error.message;
  }

  console.log('\n📡 Test 4: AniList GraphQL - Trending');
  try {
    const anilistTrending = await anilistAPI.getTrendingAnime(1);
    if (anilistTrending?.Page?.media?.length > 0) {
      console.log('✅ AniList Trending: SUCCESS');
      const media = anilistTrending.Page.media;
      console.log(`   Found ${media.length} trending anime`);
      console.log(`   #1: ${media[0].title.romaji} (Score: ${media[0].averageScore})`);
      results.anilist.success = true;
    } else {
      throw new Error('No AniList data returned');
    }
  } catch (error) {
    console.error('❌ AniList Trending: FAILED', error.message);
    results.anilist.error = error.message;
  }

  console.log('\n📡 Test 5: Combined Multi-API Search');
  try {
    const combinedResults = await searchAnimeAcrossAPIs('Attack on Titan');
    const jikanCount = combinedResults.jikan?.length || 0;
    const anilistCount = combinedResults.anilist ? 1 : 0;
    const tmdbCount = combinedResults.tmdb?.length || 0;
    
    console.log('✅ Multi-API Search: SUCCESS');
    console.log(`   Jikan: ${jikanCount} results`);
    console.log(`   AniList: ${anilistCount} results`);
    console.log(`   TMDB: ${tmdbCount} results`);
  } catch (error) {
    console.error('❌ Multi-API Search: FAILED', error.message);
  }

  console.log('\n📡 Test 6: Jikan API - Detailed Info');
  try {
    
    const searchResults = await jikanAPI.searchAnime('Jujutsu Kaisen');
    if (searchResults.length > 0) {
      const animeId = searchResults[0].mal_id;
      const details = await jikanAPI.getAnimeDetails(animeId);
      
      if (details && details.title) {
        console.log('✅ Anime Details: SUCCESS');
        console.log(`   Title: ${details.title}`);
        console.log(`   Episodes: ${details.episodes}`);
        console.log(`   Status: ${details.status}`);
        console.log(`   Genres: ${details.genres?.map(g => g.name).join(', ')}`);
      } else {
        throw new Error('No details returned');
      }
    } else {
      throw new Error('Could not find anime for details');
    }
  } catch (error) {
    console.error('❌ Anime Details: FAILED', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  let passCount = 0;
  Object.entries(results).forEach(([test, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test}`);
    if (result.error) {
      console.log(`       Error: ${result.error}`);
    }
    if (result.success) passCount++;
  });

  const totalTests = Object.keys(results).length;
  console.log('\n' + `${passCount}/${totalTests} tests passed`);

  if (passCount >= 4) {
    console.log('\n🎉 All core APIs working! Your anime data pipeline is ready!');
  } else {
    console.log('\n⚠️  Some APIs failed. Check browser console for details.');
  }

  return results;
};

export default runAPITests;
