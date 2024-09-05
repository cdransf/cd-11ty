import { shuffleArray } from '../utilities/index.js'

export default {
  filterByPostType: (posts, postType) => {
    if (postType === 'featured') return shuffleArray(posts.filter(post => post.featured === true)).slice(0, 3)
    return posts.slice(0, 5)
  }
}