<template>
  <div style="display: flex; height: 100vh; overflow: hidden;">

    <!-- MOBILE MENU BUTTON -->
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="mobile-menu-btn"
      >
        ☰
      </button>

    <!-- SIDEBAR -->
    <div :class="['sidebar', { open: sidebarOpen }]">

      <h2 style="
        margin-bottom: 20px;
        color: #222;
        text-align: center;
      ">
        📍 Campus Navigation
      </h2>

      <!-- LOGIN -->
      <div v-if="!user" style="margin-bottom: 15px;">

        <input
          v-model="email"
          placeholder="Admin email"
          style="
            width: 100%;
            margin-bottom: 8px;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid #ccc;
          "
        />

        <input
          v-model="password"
          type="password"
          placeholder="Password"
          style="
            width: 100%;
            margin-bottom: 8px;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid #ccc;
          "
        />

        <button
          @click="login"
          style="
            width: 100%;
            padding: 8px;
            border: none;
            border-radius: 6px;
            background-color: #333;
            color: white;
            cursor: pointer;
          "
        >
          Login
        </button>

      </div>

      <!-- MANAGE MODE -->
      <div 
        v-if="user"
        style="
          background-color: #f8f9fa;
          box-shadow: 2px 0 5px rgba(0,0,0,0.05);
          margin-bottom: 15px;
        "
      >

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

        <button
          @click="logout"
          style="
            width: 100%;
            margin-top: 8px;
            padding: 8px;
            border: none;
            border-radius: 6px;
            background-color: #dc3545;
            color: white;
            cursor: pointer;
          "
        >
          Logout
        </button>

      </div>

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

        <div
          style="
            background: white;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 15px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          "
        >
          <img
            v-if="selectedBuilding.image_url"
            :src="selectedBuilding.image_url"
            style="
              width: 100%;
              height: 160px;
              object-fit: cover;
              border-radius: 8px;
              margin-bottom: 10px;
            "
          />
          <h3 style="margin-bottom: 8px;">
            {{ selectedBuilding.name }}
          </h3>

          <p style="margin-bottom: 8px; color: #555;">
            {{ selectedBuilding.description }}
          </p>

          <p>
            <strong>Email:</strong>
            {{ selectedBuilding.contact_email }}
          </p>

        </div>

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
              @click="selectedClassroom = room"
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

      <div
  style="
    margin-top: 20px;
    padding: 12px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  "
>

  <h3>Feedback</h3>

  <input
    v-model="feedbackName"
    placeholder="Your name"
    style="width: 100%; margin-bottom: 8px;"
  />

  <input
    v-model="feedbackContact"
    placeholder="Contact info"
    style="width: 100%; margin-bottom: 8px;"
  />

  <textarea
    v-model="feedbackMessage"
    placeholder="Your feedback..."
    style="
      width: 100%;
      height: 80px;
      margin-bottom: 8px;
    "
  ></textarea>

  <button @click="submitFeedback">
    Send Feedback
  </button>

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
      newClassroomName: '',
      newClassroomFloor: '',
      isManageMode: false,
      hoveredBuilding: null,
      user: null,
      email: '',
      password: '',
      sidebarOpen: false,
      feedbackName: '',
      feedbackContact: '',
      feedbackMessage: '',
    }
  },

  methods: {

        async submitFeedback() {

      if (!this.feedbackMessage) {
        alert("Please write feedback")
        return
      }

      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            name: this.feedbackName,
            contact: this.feedbackContact,
            message: this.feedbackMessage
          }
        ])

      if (error) {
        alert("Error sending feedback")
      } else {

        alert("Feedback sent")

        this.feedbackName = ''
        this.feedbackContact = ''
        this.feedbackMessage = ''
      }
    },

        showUserLocation() {

      navigator.geolocation.getCurrentPosition(position => {

        const lat = position.coords.latitude
        const lng = position.coords.longitude

        L.marker([lat, lng])
          .addTo(this.map)
          .bindPopup("You are here")
          .openPopup()

        this.map.flyTo([lat, lng], 16)

      })

    },
    async loadBuildings() {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')

      if (!error) {
        this.buildings = data
        this.drawMarkers(this.filteredBuildings)
      }
    }, 
        async login() {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: this.email,
            password: this.password
          })

          if (error) {
            alert(error.message)
          } else {
            this.user = data.user
            alert('Login successful')
          }
        },

        async logout() {
          await supabase.auth.signOut()
          this.user = null
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

    async loadClassrooms(buildingId) {
      this.selectedClassroom = null
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

      // reset classroom selection
      this.selectedClassroom = null

      // show only selected building marker
      this.markers.forEach(m => {

        if (m.building.id === building.id) {

          m.marker.addTo(this.map)

          this.selectedMarker = m.marker

        } else {

          this.map.removeLayer(m.marker)

        }

      })

      // zoom
      this.map.flyTo(
        [building.latitude, building.longitude],
        18
      )

      // load classrooms
      this.loadClassrooms(building.id)

      // close mobile sidebar automatically
      this.sidebarOpen = false
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
          this.handleBuildingClick(building)
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
    this.showUserLocation()
  }
}
</script>


<style>
body {
  margin: 0;
  font-family: Arial;
}

#app {
  height: 100vh;
}

/* SIDEBAR */
.sidebar {
  width: 320px;
  padding: 20px;
  border-right: 1px solid #e5e5e5;
  overflow-y: auto;
  background-color: #fafafa;
  transition: transform 0.3s ease;
}

/* MOBILE BUTTON */
.mobile-menu-btn {
  display: none;
}

/* MOBILE */
@media (max-width: 768px) {

  .mobile-menu-btn {
    display: block;
    position: absolute;
    top: env(safe-area-inset-top, 70px);
    left: 15px;
    z-index: 2000;
    border: none;
    border-radius: 6px;
    background: #333;
    color: white;
    padding: 10px 14px;
    font-size: 18px;
    cursor: pointer;
  }

  .sidebar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 1500;
    transform: translateX(-100%);
    width: 280px;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>