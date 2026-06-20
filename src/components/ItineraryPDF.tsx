import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type {
  EntryPreference,
  GeneratedItineraryResult,
  ItineraryDayDto,
  ItineraryItemDto,
  TravelReason,
} from "@/types/tourism";
import { CATEGORY_LABELS } from "@/data/mockData";

const TRAVEL_REASON_LABEL: Record<TravelReason, string> = {
  leisure: "Lazer",
  work: "Trabalho",
  familyVisit: "Visita à família",
  events: "Eventos",
  passingThrough: "De passagem",
};

const ENTRY_LABEL: Record<EntryPreference, string> = {
  free: "Gratuito",
  paid: "Pago",
  both: "Ambos",
};

const GREEN = "#2d7a4f";
const LIGHT_GREEN = "#e8f5ee";
const GRAY = "#6b7280";
const BORDER = "#e5e7eb";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
    paddingVertical: 40,
    paddingHorizontal: 48,
    backgroundColor: "#ffffff",
  },
  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: GREEN,
  },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: GREEN },
  headerSub: { fontSize: 9, color: GRAY, marginTop: 2 },
  headerMeta: { fontSize: 8, color: GRAY, textAlign: "right" },
  /* Summary */
  summaryBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 0.6 },
  summaryValue: { fontSize: 9, fontFamily: "Helvetica-Bold", marginTop: 2 },
  /* Day section */
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 4,
    marginBottom: 8,
    marginTop: 16,
  },
  dayTitle: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  dayStops: { fontSize: 8, color: GRAY },
  /* Card */
  card: {
    border: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  cardName: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  cardRow: { flexDirection: "row", gap: 16, marginBottom: 3 },
  cardLabel: { fontSize: 8, color: GRAY, width: 72 },
  cardValue: { fontSize: 8, flex: 1 },
  badge: {
    backgroundColor: LIGHT_GREEN,
    color: GREEN,
    fontSize: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 3,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 5 },
  alert: {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    fontSize: 8,
    padding: 6,
    borderRadius: 4,
    marginTop: 6,
  },
  time: {
    fontSize: 8,
    color: GREEN,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: GRAY,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
});

function ItemCard({ item }: { item: ItineraryItemDto }) {
  return (
    <View style={s.card} wrap={false}>
      {item.suggestedTime && (
        <Text style={s.time}>{item.suggestedTime}</Text>
      )}
      <Text style={s.cardName}>
        {item.name}{" "}
        <Text style={{ fontSize: 8, color: GRAY }}>
          · {{ attraction: "Atração", event: "Evento" }[item.placeType] ?? item.placeType}
        </Text>
      </Text>

      {item.categories.length > 0 && (
        <View style={s.badgeRow}>
          {item.categories.slice(0, 4).map((c) => (
            <Text key={c.id} style={s.badge}>
              {CATEGORY_LABELS[c.slug] ?? c.name}
            </Text>
          ))}
        </View>
      )}

      <View style={s.cardRow}>
        <Text style={s.cardLabel}>Endereço</Text>
        <Text style={s.cardValue}>{item.location.address}</Text>
      </View>
      <View style={s.cardRow}>
        <Text style={s.cardLabel}>Horário</Text>
        <Text style={s.cardValue}>{item.openingHoursText}</Text>
      </View>
      <View style={s.cardRow}>
        <Text style={s.cardLabel}>Entrada</Text>
        <Text style={s.cardValue}>
          {item.price.entryType === "free" ? "Gratuita" : item.price.description}
        </Text>
      </View>
      <View style={s.cardRow}>
        <Text style={s.cardLabel}>Distância</Text>
        <Text style={s.cardValue}>{item.distanceText}</Text>
      </View>

      {item.weatherAlert && (
        <Text style={s.alert}>{item.weatherAlert}</Text>
      )}
    </View>
  );
}

function DaySection({ day }: { day: ItineraryDayDto }) {
  const dateLabel = new Date(day.date).toLocaleDateString("pt-BR", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <View>
      <View style={s.dayHeader}>
        <Text style={s.dayTitle}>
          Dia {day.dayNumber} · {dateLabel}
        </Text>
        <Text style={s.dayStops}>
          {day.items.length} parada{day.items.length !== 1 ? "s" : ""}
        </Text>
      </View>
      {day.items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </View>
  );
}

function ItineraryDocument({ result }: { result: GeneratedItineraryResult }) {
  const { request, itinerary } = result;
  const generatedAt = new Date(itinerary.generatedAt).toLocaleString("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Document title="Roteiro Lages Smart Tourism">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header} fixed>
          <View>
            <Text style={s.headerTitle}>Lages Smart Tourism</Text>
            <Text style={s.headerSub}>Serra Catarinense · Brasil</Text>
          </View>
          <Text style={s.headerMeta}>Gerado em {generatedAt}</Text>
        </View>

        {/* Summary */}
        <View style={s.summaryBox}>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Motivo da viagem</Text>
            <Text style={s.summaryValue}>{TRAVEL_REASON_LABEL[request.travelReason]}</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Entrada</Text>
            <Text style={s.summaryValue}>{ENTRY_LABEL[request.entryPreference]}</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Estadia</Text>
            <Text style={s.summaryValue}>{request.arrivalDate} → {request.departureDate}</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Categorias</Text>
            <Text style={s.summaryValue}>
              {request.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}
            </Text>
          </View>
        </View>

        {/* Days */}
        {itinerary.days.map((day) => (
          <DaySection key={day.dayNumber} day={day} />
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>Lages Smart Tourism — lagessmarthourism.app</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function downloadItineraryPDF(result: GeneratedItineraryResult) {
  const blob = await pdf(<ItineraryDocument result={result} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `roteiro-lages-${result.request.arrivalDate}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
