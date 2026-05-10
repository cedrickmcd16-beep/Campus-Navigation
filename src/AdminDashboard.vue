<template>
  <div class="admin-container">

    <div class="admin-sidebar">
      <h2>Admin Dashboard</h2>

      <button @click="logout">
        Logout
      </button>
    </div>

    <div class="admin-content">

      <h2>Buildings</h2>

      <div
        v-for="building in buildings"
        :key="building.id"
        class="building-card"
      >
        <h3>{{ building.name }}</h3>

        <button @click="loadClassrooms(building.id)">
          Load Classrooms
        </button>
      </div>

      <div v-if="selectedBuilding">

        <h2>
          Classrooms — {{ selectedBuilding.name }}
        </h2>

        <input
          v-model="newClassroomName"
          placeholder="Classroom name"
        />

        <input
          v-model="newClassroomFloor"
          placeholder="Floor"
        />

        <button @click="addClassroom">
          Add Classroom
        </button>

        <ul>
          <li
            v-for="room in classrooms"
            :key="room.id"
          >
            {{ room.name }} - {{ room.floor }}

            <button @click="deleteClassroom(room.id)">
              Delete
            </button>
          </li>
        </ul>

      </div>

    </div>

  </div>
</template>

<script>
import { supabase } from './supabase'

export default {
  data() {
    return {
      buildings: [],
      classrooms: [],
      selectedBuilding: null,
      newClassroomName: '',
      newClassroomFloor: ''
    }
  },

  methods: {

    async loadBuildings() {
      const { data } = await supabase
        .from('buildings')
        .select('*')

      this.buildings = data
    },

    async loadClassrooms(buildingId) {
      this.selectedBuilding = this.buildings.find(
        b => b.id === buildingId
      )

      const { data } = await supabase
        .from('classrooms')
        .select('*')
        .eq('building_id', buildingId)

      this.classrooms = data
    },

    async addClassroom() {
      await supabase
        .from('classrooms')
        .insert([
          {
            name: this.newClassroomName,
            floor: this.newClassroomFloor,
            building_id: this.selectedBuilding.id
          }
        ])

      this.loadClassrooms(this.selectedBuilding.id)

      this.newClassroomName = ''
      this.newClassroomFloor = ''
    },

    async deleteClassroom(id) {
      await supabase
        .from('classrooms')
        .delete()
        .eq('id', id)

      this.loadClassrooms(this.selectedBuilding.id)
    },

    async logout() {
      await supabase.auth.signOut()
      location.reload()
    }
  },

  mounted() {
    this.loadBuildings()
  }
}
</script>

<style>
.admin-container {
  display: flex;
  height: 100vh;
}

.admin-sidebar {
  width: 250px;
  background: #222;
  color: white;
  padding: 20px;
}

.admin-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.building-card {
  background: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
}
</style>
