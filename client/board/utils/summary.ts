import type { Player } from "../../../shared/player.js";
import { assertUnreachable } from "./assert.js";

function toCSV(table: string[][]) {
  return table
    .map((row) =>
      row
        .map((cell) => {
          // We remove blanks and check if the column contains
          // other whitespace,`,` or `"`.
          // In that case, we need to quote the column.
          if (cell.replace(/ /g, "").match(/[\s,"]/)) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(","),
    )
    .join("\n");
}

export function generateGameSummaryCsv(
  questionNumbers: number[],
  players: Player[],
  addlQuestions?: string[],
) {
  const table: string[][] = [];
  const headerRow = ["Player", "Rank", "Final Score"];
  addlQuestions?.forEach((question) => {
    headerRow.push(question);
  });
  questionNumbers.forEach((num, i) => {
    if (num === -1) {
      headerRow.push(`S${i + 1} (Slide)`);
      return;
    }
    headerRow.push(
      `S${i + 1} (Q${num}) Correct`,
      `S${i + 1} Response`,
      `S${i + 1} Time`,
      `S${i + 1} Points`,
    );
  });
  table.push(headerRow);

  players
    .sort((a, b) => b.score - a.score)
    .forEach((player, playerRank) => {
      const playerRow = [player.name, `${playerRank + 1}`, `${player.score}`];
      addlQuestions?.forEach((_, i) => {
        playerRow.push(player.addlQuestions?.[i] ?? "No response");
      });
      questionNumbers.forEach((qNum, sNum) => {
        if (qNum === -1) {
          playerRow.push("-");
          return;
        }

        const answer = player.answers[sNum];
        if (!answer) {
          playerRow.push("No Response", "-", "-", "0");
          return;
        }

        playerRow.push(player.correct[sNum] ? "Correct" : "Wrong");
        switch (answer.t) {
          case "standard":
          case "tf":
          case "type":
            playerRow.push(`${answer.a}`);
            break;
          case "map":
            playerRow.push(`${answer.a[0]}, ${answer.a[1]}`);
            break;
          case "multi":
            playerRow.push(JSON.stringify(answer.a));
            break;
          default:
            assertUnreachable(answer);
        }
        playerRow.push(`${player.answerTimes[sNum]}`);
        playerRow.push(`${player.record[sNum]}`);
      });
      table.push(playerRow);
    });

  return toCSV(table);
}

export function downloadFile(filename: string, text: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:text/csv;charset=utf-8,${encodeURIComponent(text)}`,
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
