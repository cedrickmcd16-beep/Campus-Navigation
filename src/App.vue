<template>
  <div style="display: flex; height: 100vh; overflow: hidden;">

    <!-- SIDE BAR -->
     <div style="
     background-color: #f8f9fa;
      box-shadow: 2px 0 5px rgba(0,0,0,0.05);
     margin-bottom: 15px;">
  <button 
    @click="isManageMode = !isManageMode"
    style="
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 6px;
      background-color: #333;
      color: white;
      cursor: pointer;
      font-weight: bold;
    "
  >
    {{ isManageMode ? "View Mode" : "Manage Mode" }}
  </button>
</div>

      <div style="
      width: 320px;
      padding: 20px;
      border-right: 1px solid #e5e5e5;
      overflow-y: auto;
      background-color: #fafafa;
      ">
      <h2 style="
        margin-bottom: 20px;
        color: #222;
        text-align: center;
      ">
        📍 Campus Navigation
      </h2>

      <input 
        v-model="searchQuery" 
        placeholder="Search buildings..."
        style="
          width: 95%;
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
          background-color: white;
        "
      />

      <h4 style="margin-bottom: 5px;">Buildings</h4>
      <ul>
        <li 
          v-for="building in filteredBuildings" 
          :key="building.id"
          @click="handleBuildingClick(building)"
          @mouseover="hoveredBuilding = building.id"
          @mouseleave="hoveredBuilding = null"
          :style="{ 
            color: '#333',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '5px',
            fontWeight: selectedBuilding?.id === building.id ? 'bold' : 'normal',
            backgroundColor: 
              selectedBuilding?.id === building.id 
                ? '#e7f1ff' 
                : hoveredBuilding === building.id 
                ? '#f5f5f5' 
                : ''
          }"
        >
          {{ building.name }}
        </li>
      </ul>

      <div v-if="selectedBuilding">
        <h3>Classrooms</h3>

        <div v-if="selectedBuilding && isManageMode" style="margin-top: 15px;">
          <h4>Add Classroom</h4>

          <input 
            v-model="newClassroomName" 
            placeholder="Classroom name"
            style="width: 100%; margin-bottom: 5px;"
          />

          <input 
            v-model="newClassroomFloor" 
            placeholder="Floor"
            style="width: 100%; margin-bottom: 5px;"
          />

          <button @click="addClassroom">
            Add Classroom
          </button>
        </div>

        <ul>
          <li 
            v-for="room in classrooms"
            :key="room.id"
            style="display: flex; justify-content: space-between; align-items: center;"
          >
            <span 
              @click="selectClassroom(room)"
              :style="{
                cursor: 'pointer',
                backgroundColor: selectedClassroom?.id === room.id ? '#d3f9d8' : ''
              }"
            >
              {{ room.name }} - {{ room.floor }}
            </span>

            <button 
              v-if="isManageMode"
              @click="deleteClassroom(room.id)"
              style="
                background: none;
                border: none;
                cursor: pointer;
                color: red;
                font-size: 16px;
              "
            >
              🗑
            </button>
          </li>
        </ul>
      </div>

      <div 
        v-if="selectedClassroom" 
        style="
          margin-top: 15px;
          padding: 12px;
          border-radius: 8px;
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
        "
      >
        <h4 style="margin-bottom: 5px;">Classroom Details</h4>
        <p><strong>Name:</strong> {{ selectedClassroom.name }}</p>
        <p><strong>Floor:</strong> {{ selectedClassroom.floor }}</p>
      </div>
    </div>

    <!-- MAP -->
    <div style="flex: 1; height: 100%;">
      <div id="map" style="height: 100%; width: 100%;"></div>
    </div>

  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from './supabase'

const buildingIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30]
})

export default {
  data() {
    return {
      buildings: [],
      classrooms: [],
      selectedBuilding: null,
      map: null,
      markers: [],
      searchQuery: '',
      selectedMarker: null,
      selectedClassroom: null,
      classroomMarker: null,
      newClassroomName: '',
      newClassroomFloor: '',
      isManageMode: false,
      hoveredBuilding: null
    }
  },

  methods: {
    async loadBuildings() {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')

      if (!error) {
        this.buildings = data
        this.drawMarkers(this.filteredBuildings)
      }
    },

    async addClassroom() {
      if (!this.newClassroomName || !this.newClassroomFloor) {
        alert("Fill all fields")
        return
      }

      const { error } = await supabase
        .from('classrooms')
        .insert([
          {
            name: this.newClassroomName,
            floor: this.newClassroomFloor,
            building_id: this.selectedBuilding.id
          }
        ])

      if (error) {
        console.error(error)
      } else {
        // clear inputs
        this.newClassroomName = ''
        this.newClassroomFloor = ''

        // reload classrooms
        this.loadClassrooms(this.selectedBuilding.id)
      }
    },

    selectClassroom(room) {
        this.selectedClassroom = room

        // remove old classroom marker
        if (this.classroomMarker) {
          this.map.removeLayer(this.classroomMarker)
        }

        const building = this.selectedBuilding

        // find index of classroom
        const index = this.classrooms.findIndex(r => r.id === room.id)

        // small fixed offsets
        const offsets = [
          [0, 0.0003],    // right
          [0, -0.0003],   // left
          [0.0003, 0],    // up
          [-0.0003, 0]    // down
        ]

        const offset = offsets[index % offsets.length]

        const lat = building.latitude + offset[0]
        const lng = building.longitude + offset[1]

        // create marker
        this.classroomMarker = L.marker([lat, lng]).addTo(this.map)

        this.classroomMarker
          .bindPopup(`${room.name} (${room.floor})`)
          .openPopup()

    },

    async loadClassrooms(buildingId) {
      this.selectedBuilding = this.buildings.find(
        b => b.id === buildingId
      )

      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('building_id', buildingId)

      if (!error) {
        this.classrooms = data
      }
    },

    handleBuildingClick(building) {
      this.map.flyTo(
        [building.latitude, building.longitude],
        18
      )

      this.loadClassrooms(building.id)
    },

      drawMarkers(buildingsList) {
    // remove old markers
    this.markers.forEach(m => this.map.removeLayer(m.marker))
    this.markers = []

    const defaultIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [30, 30]
    })

    const selectedIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [40, 40]
    })

    // add new markers
    buildingsList.forEach(building => {
      if (building.latitude && building.longitude) {
        const marker = L.marker(
          [building.latitude, building.longitude],
          { icon: defaultIcon } // ✅ use defaultIcon
        ).addTo(this.map)

        marker.bindPopup(building.name)

        this.markers.push({ marker, building })

        marker.on('click', () => {
          // reset previous selected marker
          if (this.selectedMarker) {
            this.selectedMarker.setIcon(defaultIcon)
          }

          // highlight current marker
          marker.setIcon(selectedIcon)
          this.selectedMarker = marker

          this.map.flyTo(
            [building.latitude, building.longitude],
            18
          )

          this.loadClassrooms(building.id)
        })
      }
    })
  },
      async deleteClassroom(id) {
      const confirmDelete = confirm("Delete this classroom?")

      if (!confirmDelete) return

      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', id)

      if (error) {
        console.error(error)
      } else {
        // reload classrooms
        this.loadClassrooms(this.selectedBuilding.id)

        // reset selected classroom if needed
        if (this.selectedClassroom?.id === id) {
          this.selectedClassroom = null
        }
      }
    }
},

  computed: {
    filteredBuildings() {
      return this.buildings.filter(b =>
        b.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },

  watch: {
    searchQuery() {
      this.drawMarkers(this.filteredBuildings)
    }
  },

  mounted() {
    this.map = L.map('map').setView([35.230, 33.322], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map)

    this.loadBuildings()
  }
}
</script>


<style>
body {
  font-family: Arial;
  text-align: center;
}
</style>