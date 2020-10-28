<template>
  <div class="container">
    <h3 class="title">排行榜</h3>
    <div class="item" v-for="(user, index) of rankList" :key="index">
      <span class="name">{{ user.name }}</span>
      <span class="score">{{ user.score }}分</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'RankList',
    props: {
      users: Array,
    },
    data() {
      return {
        rankList: [],
      }
    },
    watch: {
      users: {
        immediate: true,
        deep: true,
        handler() {
          let users = this.users.map(user => Object.assign({}, user));
          users.sort((a, b) => b.score - a.score);
          this.rankList = users;
        }
      }
    }
  }
</script>

<style scoped>
  .container {
    width: 200px;
    border: 1px solid #CCC;
    border-radius: 4px;
    position: fixed;
    right: 30px;
    top: 30px;
    padding: 10px 20px;
  }
  .title {
    text-align: left;
  }
  .item {
    margin: 10px 0;
    display: flex;
    justify-content: space-between;
  }
</style>
