import { View, Text, StyleSheet } from "react-native";
import Colors from "../constants/colors";
import Card from "../components/Card";
import { FlatList } from "react-native-gesture-handler";
import { getEmployeeProjects } from "../services/api";
import { useEffect, useState } from "react";

interface Employee {
  id: number;
  name: string;
  surname: string;
  emailAddress: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  type: string;
  fromDate: string;
  toDate: string;
  isActive: boolean;
  fixedPrice?: any;
  projectIdKpi?: any;
}

interface Allocation {
  id: number;
  fromDate: string;
  toDate: string;
  percentage: number;
  employee: Employee;
  project: Project;
}


export default function AllocationPlanningScreen() {

const [items, setItems] = useState<Allocation[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

  // Funzione per determinare il colore basato sullo stato del progetto
  const getProjectColor = (allocation: Allocation) => {
    const { project, toDate } = allocation;

    // Se il progetto non è attivo (finito) -> rosso
    if (!project.isActive) {
      return Colors.errorColor;
    }

    // Se il progetto è attivo, controlla le date
    const endDate = new Date(toDate);
    const now = new Date();
    const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Se la data di fine è già passata -> rosso (progetto scaduto)
    if (daysUntilEnd < 0) {
      return Colors.errorColor;
    }

    // Se mancano 30 giorni o meno -> giallo
    if (daysUntilEnd <= 30) {
      return Colors.warningColor;
    }

    // Altrimenti -> verde (progetto attivo e non in scadenza)
    return Colors.successColor;
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getEmployeeProjects();
        console.log("Progetti:", data);
        setItems(data);
      } catch (err) {
        console.error("Errore fetch:", err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cardList = () => {
    if (loading) {
      return <Text>Loading...</Text>;
    }

    if (error) {
      return <Text>Error: {error}</Text>;
    }

    return (
      <FlatList
        style={{ flex: 1, width: '100%' }}
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const {
            id,
            fromDate,
            toDate,
            percentage,
            employee: { name, surname },
            project: { name: projectName, description }
          } = item;

          const cardColor = getProjectColor(item);

          return (
            <Card
              title={`${name} ${surname}`}
              description={`${projectName} - ${percentage}%`}
              projectName={projectName}
              dateStart={fromDate}
              dateEnd={toDate}
              color={cardColor}
            />
          );
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {cardList()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
