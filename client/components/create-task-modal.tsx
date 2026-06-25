"use client"

import { Button } from "@/components/ui/button"
import useWorkers from "@/hooks/useWorkers"
import { ITask } from "@/interfaces"
import api from "@/lib/api"
import { handleAxiosError } from "@/lib/utils"
import { AlertCircle, Loader2, LocateFixed, MapPin, XIcon } from "lucide-react"
import { Dialog } from "radix-ui"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (task: ITask) => void
}

interface FormState {
  title: string
  description: string
  assignedTo: string
  status: "pending" | "in_progress" | "completed"
  deadline: string
  address: string
  latitude: number | null
  longitude: number | null
}

interface PlaceSuggestion {
  placeId: string
  mainText: string
  secondaryText: string
  fullText: string
}

const initialForm: FormState = {
  title: "",
  description: "",
  assignedTo: "",
  status: "pending",
  deadline: "",
  address: "",
  latitude: null,
  longitude: null,
}

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""

async function fetchPlaceSuggestions(
  input: string
): Promise<PlaceSuggestion[]> {
  if (!MAPS_API_KEY || input.length < 2) return []
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places:autocomplete?key=${MAPS_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask":
            "suggestions.placePrediction.text,suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat",
        },
        body: JSON.stringify({ input }),
      }
    )
    const data = await res.json()
    return (data.suggestions ?? [])
      .map((s: any) => ({
        placeId: s.placePrediction?.placeId ?? "",
        mainText: s.placePrediction?.structuredFormat?.mainText?.text ?? "",
        secondaryText:
          s.placePrediction?.structuredFormat?.secondaryText?.text ?? "",
        fullText: s.placePrediction?.text?.text ?? "",
      }))
      .filter((s: PlaceSuggestion) => s.placeId)
  } catch {
    return []
  }
}

async function fetchPlaceDetails(
  placeId: string
): Promise<{ lat: number; lng: number; address: string } | null> {
  if (!MAPS_API_KEY) return null
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?key=${MAPS_API_KEY}`,
      {
        headers: {
          "X-Goog-FieldMask": "location,formattedAddress",
        },
      }
    )
    const data = await res.json()
    if (data.location) {
      return {
        lat: data.location.latitude,
        lng: data.location.longitude,
        address: data.formattedAddress ?? "",
      }
    }
    return null
  } catch {
    return null
  }
}

export function CreateTaskModal({
  open,
  onOpenChange,
  onCreated,
}: CreateTaskModalProps) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [mapsReady, setMapsReady] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof google !== "undefined" &&
      !!google?.maps
  )
  const [locating, setLocating] = useState(false)
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)

  const { workers, loading: loadingWorkers } = useWorkers()
  const miniMapRef = useRef<HTMLDivElement>(null)
  const miniMapInstance = useRef<google.maps.Map | null>(null)
  const miniMarkerRef = useRef<google.maps.Marker | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Subscribe to Maps API load event (only when not yet ready)
  useEffect(() => {
    if (mapsReady) return
    const handler = () => setMapsReady(true)
    window.addEventListener("google-maps-loaded", handler)
    return () => window.removeEventListener("google-maps-loaded", handler)
  }, [mapsReady])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setForm(initialForm)
      setSuggestions([])
      setShowSuggestions(false)
      miniMapInstance.current = null
      miniMarkerRef.current = null
    }
    onOpenChange(next)
  }

  // Init / update mini map when coordinates change
  useEffect(() => {
    if (!form.latitude || !form.longitude || !miniMapRef.current || !mapsReady)
      return
    const lat = form.latitude
    const lng = form.longitude
    const pos = { lat, lng }

    if (!miniMapInstance.current) {
      miniMapInstance.current = new google.maps.Map(miniMapRef.current, {
        center: pos,
        zoom: 14,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      })

      miniMarkerRef.current = new google.maps.Marker({
        position: pos,
        map: miniMapInstance.current,
        draggable: true,
      })

      miniMarkerRef.current.addListener(
        "dragend",
        (e: google.maps.MapMouseEvent) => {
          const newLat = e.latLng?.lat()
          const newLng = e.latLng?.lng()
          if (newLat != null && newLng != null) {
            setForm((prev) => ({
              ...prev,
              latitude: newLat,
              longitude: newLng,
            }))
          }
        }
      )

      miniMapInstance.current.addListener(
        "click",
        (e: google.maps.MapMouseEvent) => {
          const newLat = e.latLng?.lat()
          const newLng = e.latLng?.lng()
          if (newLat != null && newLng != null) {
            setForm((prev) => ({
              ...prev,
              latitude: newLat,
              longitude: newLng,
            }))
            miniMarkerRef.current?.setPosition({ lat: newLat, lng: newLng })
          }
        }
      )
    } else {
      miniMapInstance.current.setCenter(pos)
      miniMarkerRef.current?.setPosition(pos)
    }
  }, [form.latitude, form.longitude, mapsReady])

  // Debounced address search using Places API (New) REST
  const handleAddressChange = (value: string) => {
    setForm((prev) => ({ ...prev, address: value }))
    setActiveSuggestion(-1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim() || value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      const results = await fetchPlaceSuggestions(value)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    }, 350)
  }

  const handleSelectSuggestion = async (s: PlaceSuggestion) => {
    setShowSuggestions(false)
    setForm((prev) => ({ ...prev, address: s.fullText || s.mainText }))
    setSuggestions([])

    const details = await fetchPlaceDetails(s.placeId)
    if (details) {
      setForm((prev) => ({
        ...prev,
        address: details.address || s.fullText,
        latitude: details.lat,
        longitude: details.lng,
      }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveSuggestion((p) => Math.min(p + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveSuggestion((p) => Math.max(p - 1, 0))
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault()
      handleSelectSuggestion(suggestions[activeSuggestion])
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  // "Use current location" — browser Geolocation (no Maps key needed)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by this browser")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        setForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: prev.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        }))

        // Reverse geocode if Maps is ready
        if (mapsReady) {
          new google.maps.Geocoder().geocode(
            { location: { lat, lng } },
            (results, status) => {
              if (status === "OK" && results?.[0]) {
                setForm((prev) => ({
                  ...prev,
                  address: results[0].formatted_address,
                }))
              }
            }
          )
        }
        setLocating(false)
      },
      () => {
        toast.error("Could not get your current location")
        setLocating(false)
      },
      { timeout: 8000 }
    )
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)

    try {
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
      }
      if (form.assignedTo) body.assignedTo = form.assignedTo
      if (form.latitude != null) body.latitude = form.latitude
      if (form.longitude != null) body.longitude = form.longitude
      if (form.deadline) body.deadline = new Date(form.deadline).toISOString()

      const response = await api.post("/tasks/register", body)
      if (!response.data.success) {
        toast.error("Failed to create task")
        return
      }
      toast.success("Task created")
      onCreated(response.data.data as ITask)
      handleOpenChange(false)
    } catch (error: any) {
      handleAxiosError(error)
    } finally {
      setSubmitting(false)
    }
  }

  const hasLocation = form.latitude != null && form.longitude != null

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Create Task
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <XIcon size={18} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="Task title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Description
              </label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={2}
                placeholder="Brief description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* Assignee */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Assign to worker
              </label>
              <select
                className={inputCls}
                value={form.assignedTo}
                onChange={(e) =>
                  setForm({ ...form, assignedTo: e.target.value })
                }
                disabled={loadingWorkers}
              >
                <option value="">
                  {loadingWorkers ? "Loading workers…" : "— Unassigned —"}
                </option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Status + Deadline */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Status
                </label>
                <select
                  className={inputCls}
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as FormState["status"],
                    })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="flex items-center gap-1 text-xs font-medium text-gray-700">
                  <MapPin size={12} />
                  Task location (destination)
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                >
                  {locating ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <LocateFixed size={11} />
                  )}
                  Use my location
                </button>
              </div>

              {/* Custom autocomplete input + dropdown */}
              <div ref={containerRef} className="relative">
                <input
                  className={inputCls}
                  placeholder="Search address or place…"
                  value={form.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() =>
                    suggestions.length > 0 && setShowSuggestions(true)
                  }
                  autoComplete="off"
                />

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute top-full right-0 left-0 z-10 mt-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {suggestions.map((s, i) => (
                      <li
                        key={s.placeId}
                        onMouseDown={() => handleSelectSuggestion(s)}
                        className={`flex cursor-pointer items-start gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 ${
                          i === activeSuggestion ? "bg-blue-50" : ""
                        }`}
                      >
                        <MapPin
                          size={14}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />
                        <span>
                          <span className="font-medium text-gray-900">
                            {s.mainText}
                          </span>
                          {s.secondaryText && (
                            <span className="ml-1 text-xs text-gray-400">
                              {s.secondaryText}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* No API key warning */}
              {!MAPS_API_KEY && (
                <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-2 text-xs text-amber-700">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  <span>
                    Add{" "}
                    <code className="font-mono">
                      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    </code>{" "}
                    to <code className="font-mono">.env</code> to enable address
                    search. You can still use <em>Use my location</em>.
                  </span>
                </div>
              )}

              {/* Mini map — height animates open once location is set */}
              <div
                className={`mt-2 overflow-hidden rounded-lg border border-gray-200 transition-all duration-300 ${
                  hasLocation ? "h-44" : "h-0 border-0"
                }`}
              >
                <div ref={miniMapRef} className="h-full w-full bg-gray-100" />
              </div>

              {hasLocation && (
                <p className="mt-1 text-xs text-gray-400">
                  {form.latitude!.toFixed(5)}, {form.longitude!.toFixed(5)} ·
                  drag pin or click map to fine-tune
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" type="button" disabled={submitting}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={submitting}
                className="disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Creating…
                  </span>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
