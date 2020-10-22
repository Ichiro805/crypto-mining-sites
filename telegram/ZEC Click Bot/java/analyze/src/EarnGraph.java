import java.util.*;

public class EarnGraph {

	private static final double DAILY_INCOME = 0.00036d;

	private static final double REFFERAL_PERCENT = 0.15d;

	private static final double ZEC_PRICE = 72d;

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		int refferals = sc.nextInt();
		int days = sc.nextInt();
		double[] table = calculate(refferals, days);

		double totalIncome = table[0];
		System.out.println("YOUR INCOME: " + String.format("%.12f", table[0]));
		for (int i = 1; i < table.length; i++) {
			System.out.println("Refferal[" + i + "]: " + String.format("%.12f", table[i]));
			totalIncome += table[i];
		}

		System.out.println("Total income for " + days + " days: " + String.format("%.12f", totalIncome));
		System.out.println("Income is: " + totalIncome * ZEC_PRICE + "$");
	}

	private static double[] calculate(int refferals, int days) {
		double[] refferalsIncome = new double[refferals];
		for (int i = 0; i < refferalsIncome.length; i++) {
			refferalsIncome[i] = days * DAILY_INCOME;
		}
		for (int i = refferalsIncome.length - 1; i > 0; i--) {
			refferalsIncome[i - 1] += refferalsIncome[i] * REFFERAL_PERCENT;
		}

		return refferalsIncome;
	}
}